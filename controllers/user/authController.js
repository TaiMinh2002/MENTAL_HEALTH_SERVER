const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../../models/user/userModel');
const validator = require('validator');
const { SECRET_KEY, TOKEN_EXPIRATION, REFRESH_TOKEN_EXPIRATION } = process.env;

const revokedTokens = [];

const generateToken = (user) => {
    return jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET_KEY, { expiresIn: TOKEN_EXPIRATION });
};

const generateRefreshToken = (user) => {
    return jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: REFRESH_TOKEN_EXPIRATION });
};

exports.signup = async (req, res) => {
    const { identifier, username, password, confirm_password } = req.query;

    if (!identifier || !username || !password || !confirm_password) {
        return res.status(400).json({ error: 'Username, identifier, password, and confirm password are required' });
    }

    if (password !== confirm_password) {
        return res.status(400).json({ error: 'Password and confirm password do not match' });
    }

    let userData = { username, role: 2 };
    if (validator.isEmail(identifier)) {
        userData.email = identifier;
    } else if (validator.isMobilePhone(identifier, 'vi-VN')) {
        userData.phone_number = identifier;
    } else {
        return res.status(400).json({ error: 'Identifier must be a valid email or phone number' });
    }

    if (!validator.isStrongPassword(password, { minLength: 8 })) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long and meet other criteria' });
    }

    userData.password = await bcrypt.hash(password, 10);

    try {
        const existingUser = await User.getUserByEmailOrPhoneNumber(identifier);
        if (existingUser) {
            const errorMsg = userData.email ? 'Email already exists' : 'Phone number already exists';
            return res.status(400).json({ error: errorMsg });
        }

        const userId = await User.createUser(userData);
        res.status(201).json({ message: 'User created successfully', data: { id: userId } });
    } catch (err) {
        console.error('Failed to create user:', err);
        res.status(500).json({ error: 'Failed to create user' });
    }
};

exports.login = async (req, res) => {
    const { identifier, password } = req.query;

    try {
        const user = await User.getUserByEmailOrPhoneNumber(identifier);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.status !== 1) {
            return res.status(403).json({ error: 'User account is disabled' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Incorrect password' });
        }

        const token = generateToken(user);
        const refreshToken = generateRefreshToken(user);

        res.json({
            msg: "success",
            code: 200,
            data: {
                user,
                token,
                refreshToken,
            },
        });
    } catch (err) {
        console.error('Failed to log in:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.refreshToken = (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token is required' });
    }

    try {
        const user = jwt.verify(refreshToken, SECRET_KEY);
        if (revokedTokens.includes(refreshToken)) {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }

        const newToken = generateToken(user);
        res.json({ token: newToken });
    } catch (err) {
        console.error('Failed to refresh token:', err);
        res.status(401).json({ error: 'Invalid refresh token' });
    }
};

exports.logout = (req, res) => {
    res.json({ message: 'Logout successful' });
};
