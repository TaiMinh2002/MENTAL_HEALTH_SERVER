const bcrypt = require('bcryptjs');
const validator = require('validator');
const User = require('../../models/user/userModel');
const { UploadClient } = require('@uploadcare/upload-client');
require('dotenv').config();

const getBaseUrl = (req) => {
    const serverIp = process.env.SERVER_IP || 'localhost';
    return req.protocol + '://' + serverIp + ':' + process.env.PORT;
};

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

exports.getAllUsers = (req, res) => {
    const { page = 1, limit = 10, keyword = '' } = req.query;
    User.getAllUsers(page, limit, keyword, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        User.countAllUsers(keyword, (err, countResults) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            const total = countResults[0].total;

            const usersWithStrings = results.map(user => ({
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
        });
    });
};

exports.getUserById = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    if (id != user_id) {
        return res.status(403).json({ error: 'You do not have permission to access this user' });
    }

    try {
        const results = await User.getUserById(id);
        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = results[0];
        user.status_string = getStatusString(user.status);
        user.sleep_string = getSleepString(user.sleep);
        user.stress_string = getStressString(user.stress);
        user.mood_string = getMoodString(user.mood);
        user.gender_string = getGenderString(user.gender);
        user.is_professional_request_string = getProfessionalRequestString(user.is_professional_request);

        res.json(user);
    } catch (err) {
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
    if (username) {
        userData.username = username;
    }
    if (password) {
        if (!validator.isStrongPassword(password, { minLength: 8 })) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long and meet other criteria' });
        }
        const hash = await bcrypt.hash(password, 10);
        userData.password = hash;
    }
    if (avatar) {
        userData.avatar = avatar;
    }
    if (age) {
        userData.age = age;
    }
    if (sleep) {
        userData.sleep = sleep;
    }
    if (stress) {
        userData.stress = stress;
    }
    if (mood) {
        userData.mood = mood;
    }
    if (gender) {
        userData.gender = gender;
    }
    if (is_professional_request) {
        userData.is_professional_request = is_professional_request;
    }

    try {
        const result = await User.updateUser(id, userData);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const updatedUser = await User.getUserById(id);
        if (updatedUser.length === 0) {
            return res.status(404).json({ error: 'User not found after update' });
        }

        res.json({
            msg: "success",
            code: 200,
            data: {
                user: updatedUser[0]
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update user' });
    }
};

exports.deleteUser = (req, res) => {
    const { id } = req.params;
    User.checkIfUserExists(id, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        if (results.length === 0 || results[0].deleted_at) {
            return res.status(404).json({ error: 'User not found' });
        }
        User.deleteUser(id, (err, results) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            res.json({ message: 'User marked as deleted' });
        });
    });
};

exports.pauseUser = (req, res) => {
    const { id } = req.params;

    User.getUserById(id, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = { status: 2 };

        User.updateUser(id, userData, (err, updateResults) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            res.json({ message: 'User account paused successfully', status_string: 'Tạm dừng' });
        });
    });
};
