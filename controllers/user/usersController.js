const bcrypt = require('bcryptjs');
const validator = require('validator');
const User = require('../../models/user/userModel');
const { UploadClient } = require('@uploadcare/upload-client');
require('dotenv').config();

const getStatusString = (status) => {
    switch (status) {
        case 1:
            return 'Đang sử dụng';
        case 2:
            return 'Tạm dừng';
        default:
            return 'Không xác định';
    }
};

const getSleepString = (sleep) => {
    switch (sleep) {
        case 1:
            return '7-9 hours';
        case 2:
            return '6-7 hours';
        case 3:
            return '5 hours';
        case 4:
            return '3-4 hours';
        case 5:
            return '<3 hours';
        default:
            return 'Unknown';
    }
};

const getStressString = (stress) => {
    switch (stress) {
        case 1:
            return 'Not Stressed';
        case 2:
            return 'Slightly Stressed';
        case 3:
            return 'Moderately Stressed';
        case 4:
            return 'Very Stressed';
        case 5:
            return 'Extremely Stressed';
        default:
            return 'Unknown';
    }
};

const getMoodString = (mood) => {
    switch (mood) {
        case 1:
            return 'I Feel Great';
        case 2:
            return 'I Feel Good';
        case 3:
            return 'I Feel Neutral';
        case 4:
            return 'I Feel Sad';
        case 5:
            return 'I Feel Tired';
        default:
            return 'Unknown';
    }
};

const getGenderString = (gender) => {
    switch (gender) {
        case 1:
            return 'Male';
        case 2:
            return 'Female';
        default:
            return 'Không xác định';
    }
};

const getProfessionalRequestString = (is_professional_request) => {
    switch (is_professional_request) {
        case 1:
            return 'Yes';
        case 2:
            return 'No';
        default:
            return 'Không xác định';
    }
};

const uploadToUploadcare = async (file) => {
    try {
        const client = new UploadClient({ publicKey: process.env.UPLOADCARE_PUBLIC_KEY });
        const response = await client.uploadFile(file.buffer, {
            fileName: file.originalname,
            contentType: file.mimetype,
        });
        return response.cdnUrl;
    } catch (error) {
        console.error('Error uploading to Uploadcare:', error.message);
        throw new Error('Error uploading file to Uploadcare');
    }
};

exports.getAllUsers = async (req, res) => {
    const { page = 1, limit = 10, keyword = '' } = req.query;

    try {
        const users = await User.getAllUsers(parseInt(page), parseInt(limit), keyword);
        const total = await User.countAllUsers(keyword);

        const usersWithStrings = users.map(user => ({
            ...user,
            status_string: getStatusString(user.status),
            sleep_string: getSleepString(user.sleep),
            stress_string: getStressString(user.stress),
            mood_string: getMoodString(user.mood),
            gender_string: getGenderString(user.gender),
            is_professional_request_string: getProfessionalRequestString(user.is_professional_request),
        }));

        res.json({
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            total_page: Math.ceil(total / limit),
            users: usersWithStrings,
        });
    } catch (err) {
        console.error('Error fetching users:', err.message);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

exports.getUserById = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    if (id != user_id) {
        return res.status(403).json({ error: 'You do not have permission to access this user' });
    }

    try {
        const user = await User.getUserById(id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.status_string = getStatusString(user.status);
        user.sleep_string = getSleepString(user.sleep);
        user.stress_string = getStressString(user.stress);
        user.mood_string = getMoodString(user.mood);
        user.gender_string = getGenderString(user.gender);
        user.is_professional_request_string = getProfessionalRequestString(user.is_professional_request);

        res.json(user);
    } catch (err) {
        console.error('Error fetching user:', err.message);
        res.status(500).json({ error: 'Failed to retrieve user' });
    }
};

exports.updateUser = async (req, res) => {
    const id = req.query.id || req.body.id;
    const user_id = req.user.id;

    if (id != user_id) {
        return res.status(403).json({ error: 'You do not have permission to update this user' });
    }

    const {
        username, password, sleep, stress, age, mood, gender, is_professional_request
    } = req.query.id ? req.query : req.body;
    let avatar;

    if (req.file) {
        try {
            avatar = await uploadToUploadcare(req.file);
        } catch (error) {
            return res.status(500).json({ error: 'Error uploading file to Uploadcare' });
        }
    }

    const userData = {};
    if (username) userData.username = username;
    if (password) {
        if (!validator.isStrongPassword(password, { minLength: 8 })) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long and meet other criteria' });
        }
        userData.password = await bcrypt.hash(password, 10);
    }
    if (avatar) userData.avatar = avatar;
    if (age) userData.age = age;
    if (sleep) userData.sleep = sleep;
    if (stress) userData.stress = stress;
    if (mood) userData.mood = mood;
    if (gender) userData.gender = gender;
    if (is_professional_request) userData.is_professional_request = is_professional_request;

    try {
        const result = await User.updateUser(id, userData);
        if (result === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const updatedUser = await User.getUserById(id);

        res.json({
            msg: "success",
            code: 200,
            data: {
                user: updatedUser,
            },
        });
    } catch (err) {
        console.error('Error updating user:', err.message);
        res.status(500).json({ error: 'Failed to update user' });
    }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.checkIfUserExists(id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await User.deleteUser(id);
        res.json({ message: 'User marked as deleted' });
    } catch (err) {
        console.error('Error deleting user:', err.message);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};

exports.pauseUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.getUserById(id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await User.pauseUser(id);
        res.json({
            message: 'User account paused successfully',
            status_string: 'Tạm dừng',
        });
    } catch (err) {
        console.error('Error pausing user:', err.message);
        res.status(500).json({ error: 'Failed to pause user' });
    }
};
