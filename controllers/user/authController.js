const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../../models/user/userModel');
const validator = require('validator');
const { SECRET_KEY, TOKEN_EXPIRATION, REFRESH_TOKEN_EXPIRATION } = process.env;

// Generate Token
const generateToken = (user) => {
    return jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: TOKEN_EXPIRATION });
};

// Generate Refresh Token
const generateRefreshToken = (user) => {
    return jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: REFRESH_TOKEN_EXPIRATION });
};

// Signup API
exports.signup = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    if (!validator.isEmail(email)) {
        return res.status(401).json({ error: 'Invalid email format' });
    }

    if (!validator.isStrongPassword(password, { minLength: 8 })) {
        return res.status(402).json({ error: 'Password must be at least 8 characters long and meet other criteria' });
    }

    const hash = await bcrypt.hash(password, 12); // Tăng số lần băm để bảo mật hơn
    const userData = { username, email, password: hash, role: 2 };

    try {
        User.getUserByEmail(email, async (err, existingUser) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (existingUser.length > 0) {
                return res.status(400).json({ error: 'Email already exists' });
            }

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

            // Lưu refreshToken vào cookie HTTP-only để bảo mật
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // Chỉ dùng khi ở production
                sameSite: 'Strict',  // Cookie chỉ gửi khi cùng domain
                maxAge: REFRESH_TOKEN_EXPIRATION * 1000 // thời gian tồn tại của cookie
            });

            res.json({ token });
        });
    });
};

// Refresh Token API
exports.refreshToken = (req, res) => {
    const refreshToken = req.cookies.refreshToken; // Lấy refreshToken từ cookie

    if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token is required' });
    }

    jwt.verify(refreshToken, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }

        const newToken = generateToken(user);

        res.json({ token: newToken });
    });
};

// Logout API
exports.logout = (req, res) => {
    const refreshToken = req.cookies.refreshToken; // Lấy refreshToken từ cookie

    if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token is required' });
    }

    jwt.verify(refreshToken, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }

        // Xóa refreshToken khỏi cơ sở dữ liệu (hoặc bạn có thể chỉ xóa cookie)
        User.deleteRefreshToken(user.id, (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to revoke refresh token' });
            }

            res.clearCookie('refreshToken', { // Xóa cookie lưu refreshToken
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict'
            });

            res.json({ message: 'Logout successful' });
        });
    });
};
