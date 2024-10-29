const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../../models/user/userModel');
const validator = require('validator');
const { SECRET_KEY, TOKEN_EXPIRATION, REFRESH_TOKEN_EXPIRATION } = process.env;

const revokedTokens = [];

// Generate Token
const generateToken = (user) => {
    return jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET_KEY, { expiresIn: TOKEN_EXPIRATION });
};

// Generate Refresh Token
const generateRefreshToken = (user) => {
    return jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: REFRESH_TOKEN_EXPIRATION });
};

exports.signup = async (req, res) => {
    const { identifier, username, password } = req.body;

    if (!identifier || !username || !password) {
        return res.status(400).json({ error: 'Username, identifier, and password are required' });
    }

    // Xác định loại của identifier (email hoặc phone_number)
    let userData = { username, role: 2 };
    if (validator.isEmail(identifier)) {
        userData.email = identifier;
    } else if (validator.isMobilePhone(identifier, 'vi-VN')) {
        userData.phone_number = identifier;
    } else {
        return res.status(400).json({ error: 'Identifier must be a valid email or phone number' });
    }

    // Kiểm tra độ mạnh của mật khẩu
    if (!validator.isStrongPassword(password, { minLength: 8 })) {
        return res.status(402).json({ error: 'Password must be at least 8 characters long and meet other criteria' });
    }

    // Mã hóa mật khẩu
    userData.password = await bcrypt.hash(password, 10);

    try {
        // Kiểm tra nếu email hoặc số điện thoại đã tồn tại
        User.getUserByEmailOrPhoneNumber(identifier, async (err, existingUser) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (existingUser.length > 0) {
                const errorMsg = userData.email ? 'Email already exists' : 'Phone number already exists';
                return res.status(400).json({ error: errorMsg });
            }

            // Tạo người dùng mới
            User.createUser(userData, (err, result) => {
                if (err) {
                    console.error('Failed to create user:', err);
                    return res.status(500).json({ error: 'Failed to create user' });
                }
                res.status(201).json({ message: 'User created successfully', data: { id: result.insertId } });
            });
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create user' });
    }
};

exports.login = (req, res) => {
    const { identifier, password } = req.body;

    User.getUserByEmailOrPhoneNumber(identifier, (err, results) => {
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

            // Tạo token và refresh token
            const token = generateToken(user);
            const refreshToken = generateRefreshToken(user);

            res.json({
                msg: "success",
                code: 200,
                data: {
                    user,
                    token,
                    refreshToken
                }
            });
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
