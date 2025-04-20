const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator')
require('dotenv').config();
const authenticateToken = require('./../../middleware/auth')


//! create a user (signup)
router.post('/signup', [
    body('username', 'username is required').notEmpty(),
    body('password', 'password is required').notEmpty().isLength({ min: 6 }),
    body('role', 'role is required').notEmpty(),
    body('role', `role must be either 'admin' or 'teacher`).isIn(['admin', 'teacher']),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.json({ errors: errors.array() })
        }
        const User = req.app.locals.db.User;
        const hashedPassword = await hashPassword(req);
        const newUser = await User.create({
            username: req.body.username,
            password: hashedPassword,
            role: req.body.role
        })
        res.status(201).json({ message: "User created successfully", user: newUser });

    } catch (error) {
        res.status(500).json({ error: 'Something went wrong with the server', details: error.message });

    }
})


//!user login
router.post('/login', [
    body('username', 'username is required').notEmpty(),
    body('password', 'password is required').notEmpty()
],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.json({ errors: errors.array() })
            }
            const User = req.app.locals.db.User;
            const { username, password } = req.body;
            const requiredUser = await User.findOne({ where: { username: username } });
            if (!requiredUser) {
                return res.status(404).json('User not found');
            } else {
                const isValidPassword = await bcrypt.compare(password, requiredUser.password);
                if (!isValidPassword) {
                    res.json("wrong password")
                } else {
                    const accessToken = await jwt.sign({ role: requiredUser.role, id: requiredUser.id }, process.env.JWT_SECRET, { expiresIn: '2d' });
                    const userJSON = requiredUser.toJSON();
                    userJSON.accessToken = accessToken;
                    res.json(userJSON);
                }
            }
        } catch (error) {
            res.status(500).json({ error: 'Something went wrong with the server', details: error.message });

        }
    })


//!create student by user
router.post('/students', authenticateToken, async (req, res) => {
    const Student = req.app.locals.db.Student;

    const token = req.userPayload.token;
    if (token == 'admin' || 'teacher') {
        const { name, age, grade } = req.body;
        const newStudent = await Student.create({
            name: req.body.name,
            age: req.body.age,
            grade: req.body.grade,
            createdBy: req.userPayload.id


        })
        res.json(newStudent)
    }
})

router.get('/students', authenticateToken, async (req, res) => {
    const User = req.app.locals.db.User;
    const Student = req.app.locals.db.Student;
    if (req.userPayload.role == 'teacher') {
        const students = await Student.findOne({ where: { createdBy: req.userPayload.id } });
        if (!students) {
            res.status(404).json('No students found')
        } else {
            res.json(students)
        }
    } else {
        const students = await Student.findAll();

        res.json(students)
    }
})


// router.put('/students/:id', authenticateToken, async (req, res) => {
//     const User = req.app.locals.db.User;
//     const Student = req.app.locals.db.Student;
//     const requiredStudent = await Student.findByPk(req.params.id);
//     const body= req.body;
//     if (req.userPayload.role == 'teacher') {
//         // const students = await Student.findOne({ where: { createdBy: req.userPayload.id } });
//         if (requiredStudent.createdBy === req.userPayload.id) {
            
//             await requiredStudent.update(body)
//             res.json(requiredStudent);

//         }
//         else if(req.userPayload.role == 'admin'){
//             await requiredStudent.update(body)
//             res.json(requiredStudent);
//         }

//     }
// })

router.put('/students/:id', authenticateToken, async (req, res) => {
    try {
        const Student = req.app.locals.db.Student;
        const requiredStudent = await Student.findByPk(req.params.id);
        const body = req.body;

        if (!requiredStudent) {
            return res.status(404).json({ error: 'Student not found' });
        }

        if (req.userPayload.role === 'admin' || requiredStudent.createdBy === req.userPayload.id) {
            await requiredStudent.update(body);
            return res.json(requiredStudent);
        } else {
            return res.status(403).json({ error: 'You are not authorized to update this student' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});


// router.delete('/students/:id', authenticateToken, async (req, res) => {
//     const User = req.app.locals.db.User;
//     const Student = req.app.locals.db.Student;
//     const requiredStudent = await Student.findByPk(req.params.id);
//     if (req.userPayload.role == 'teacher') {
//         // const students = await Student.findOne({ where: { createdBy: req.userPayload.id } });
//         if (requiredStudent.createdBy == req.userPayload.id) {

//             await requiredStudent.destroy()
//             res.json(requiredStudent);

//         }
//         else {
//             await requiredStudent.destroy()
//             res.json(requiredStudent);
//         }

//     }
// })
router.delete('/students/:id', authenticateToken, async (req, res) => {
    try {
        const Student = req.app.locals.db.Student;
        const requiredStudent = await Student.findByPk(req.params.id);

        if (!requiredStudent) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Allow if admin OR the teacher who created the student
        if (req.userPayload.role === 'admin' || requiredStudent.createdBy === req.userPayload.id) {
            await requiredStudent.destroy();
            return res.json({ message: 'Student deleted successfully', student: requiredStudent });
        } else {
            return res.status(403).json({ error: 'You are not authorized to delete this student' });
        }

    } catch (err) {
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

module.exports = router;

async function hashPassword(req) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    return hashedPassword;
}
