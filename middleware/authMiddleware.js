const jwt = require('jsonwebtoken');
require('dotenv').config();

const { SECRET_KEY } = process.env;

// Middleware để xác thực token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(403).send('A token is required for authentication');
    }
    jwt.verify(token.split(' ')[1], SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(401).send('Invalid Token');
        }
        req.user = user; // Gán thông tin user từ token vào request
        next();
    });
};

// Middleware để kiểm tra vai trò
const verifyRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).send('User role not found');
        }

        console.log('User Role:', req.user.role); // Log vai trò người dùng
        if (!roles.includes(req.user.role)) {
            return res.status(403).send('You do not have the required role to access this resource');
        }
        next();
    };
};

module.exports = {
    verifyToken,
    verifyRole,
};
