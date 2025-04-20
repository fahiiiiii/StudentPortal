const express = require('express');
const app = express()
const bodyParser = require('body-parser');
const connectDB = require('./config/db')
// const User = require('./models/User')
app.use(bodyParser.json());
app.use('/', require('./routes/api/users'))

async function startServer() {
    const sequelize = await connectDB();
    const User = require('./models/User')(sequelize)
    const Student = require('./models/Student')(sequelize)
    sequelize.sync()
    console.log('Database synchronized');
    app.locals.db = { sequelize, User, Student };
    const port = process.env.PORT;
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`)
    })

}

startServer()
app.get('/', (req, res) => {
    res.json('Welcome to the Student Management System')
})