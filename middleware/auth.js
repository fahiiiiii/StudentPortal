const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = async (req, resizeBy, next) => {
    const authHeaders = req.headers.authorization;
    const token = authHeaders && authHeaders.split(' ')[1];
    if (!token) {
        return res.status(401).json('Unauthorized');
    } else {
        jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
            if (err) {
                return res.status(401).json('Unauthorized');

            } else {
                req.userPayload = payload;
                next();
            }
        })
    }
} 