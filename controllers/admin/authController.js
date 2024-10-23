const bcrypt = require('bcryptjs');
const User = require('../../models/user/userModel');

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

            res.json({ message: 'Login successful', user });
        });
    });
};

// Logout API
exports.logout = (req, res) => {
    res.json({ message: 'Logout successful' });
};
