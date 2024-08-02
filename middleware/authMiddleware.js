const jwt = require('jsonwebtoken');
require('dotenv').config();

const { SECRET_KEY } = process.env;

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(403).send('A token is required for authentication');
    }
    jwt.verify(token.split(' ')[1], SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(401).send('Invalid Token');
        }
        req.user = user;
        next();
    });
};

module.exports = verifyToken;
