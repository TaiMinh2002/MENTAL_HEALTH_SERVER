const bcrypt = require('bcryptjs');
const User = require('../../models/user/userModel');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.getUserByEmailOrPhoneNumber(email);

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

        res.json({ message: 'Login successful', user });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.logout = (req, res) => {
    res.json({ message: 'Logout successful' });
};
