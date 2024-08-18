const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../../models/user/userModel');
const validator = require('validator');
const { SECRET_KEY, TOKEN_EXPIRATION, REFRESH_TOKEN_EXPIRATION } = process.env;

const revokedTokens = [];

// Generate Token
const generateToken = (user) => {
    return jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: TOKEN_EXPIRATION });
};

// Generate Refresh Token
const generateRefreshToken = (user) => {
    return jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: REFRESH_TOKEN_EXPIRATION });
};

// Login API
exports.login = (req, res) => {
    const { email, password } = req.body;

    User.getUserByEmail(email, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (!results || results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = results[0];

        if (user.status !== 1) {
            return res.status(403).json({ error: 'User account is disabled' });
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err || !isMatch) {
                return res.status(401).json({ error: 'Incorrect password' });
            }

            const token = generateToken(user);
            const refreshToken = generateRefreshToken(user);

            res.json({ token, refreshToken });
        });
    });
};

// Refresh Token API
exports.refreshToken = (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token is required' });
    }

    jwt.verify(refreshToken, SECRET_KEY, (err, user) => {
        if (err || revokedTokens.includes(refreshToken)) {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }

        const newToken = generateToken(user);

        res.json({ token: newToken });
    });
};

// Logout API
exports.logout = (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token is required' });
    }

    jwt.verify(refreshToken, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }

        revokedTokens.push(refreshToken);

        res.json({ message: 'Logout successful' });
    });
};
