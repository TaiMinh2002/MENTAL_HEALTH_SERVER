const bcrypt = require('bcryptjs');
const validator = require('validator');
const User = require('../models/userModel');
const bucket = require('../firebase'); // Import Firebase Storage bucket
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

// Tải ảnh lên Firebase Storage
const uploadToFirebase = (file) => {
    return new Promise((resolve, reject) => {
        const { originalname, buffer } = file;
        const blob = bucket.file(originalname);
        const blobStream = blob.createWriteStream({
            metadata: {
                contentType: file.mimetype
            }
        });

        blobStream.on('error', (err) => {
            reject(err);
        });

        blobStream.on('finish', async () => {
            try {
                await blob.makePublic(); // Làm cho ảnh công khai
                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
                resolve(publicUrl);
            } catch (error) {
                reject(error);
            }
        });

        blobStream.end(buffer);
    });
};

// Lấy tất cả người dùng với phân trang và tìm kiếm
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

            // Thêm status_string vào kết quả trả về
            const usersWithStatusString = results.map(user => ({
                ...user,
                status_string: getStatusString(user.status),
            }));

            res.json({
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                total_page: Math.ceil(total / limit),
                users: usersWithStatusString,
            });
        });
    });
};

// Lấy chi tiết người dùng theo ID
exports.getUserById = (req, res) => {
    const { id } = req.params;
    User.getUserById(id, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = results[0];
        user.status_string = getStatusString(user.status);

        res.json(user);
    });
};

// Tạo mới hoặc cập nhật thông tin người dùng (upsert)
exports.upsertUser = async (req, res) => {
    const { id } = req.params;
    const { username, email, password } = req.body;

    let avatar = null;
    if (req.file) {
        try {
            avatar = await uploadToFirebase(req.file);
        } catch (error) {
            return res.status(500).json({ error: 'Error uploading file to Firebase' });
        }
    }

    if (id) {
        const userData = {};
        if (username) userData.username = username;
        if (email) {
            if (!validator.isEmail(email)) {
                return res.status(400).json({ error: 'Invalid email format' });
            }
            userData.email = email;
        }
        if (password) {
            if (!validator.isStrongPassword(password, { minLength: 6, minLowercase: 1, minUppercase: 1, minSymbols: 1 })) {
                return res.status(400).json({ error: 'Password must be at least 6 characters long, contain at least 1 uppercase letter, 1 lowercase letter, và 1 special character' });
            }
            bcrypt.hash(password, 10, (err, hash) => {
                if (err) {
                    return res.status(500).json({ error: err });
                }
                userData.password = hash;
                if (avatar) userData.avatar = avatar;
                updateUser(id, userData, res, req);
            });
        } else {
            if (avatar) userData.avatar = avatar;
            updateUser(id, userData, res, req);
        }
    } else {
        const errors = {};
        if (!username) errors.username = 'Username is required';
        if (!email) errors.email = 'Email is required';
        if (!password) errors.password = 'Password is required';

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ errors });
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        if (!validator.isStrongPassword(password, { minLength: 6, minLowercase: 1, minUppercase: 1, minSymbols: 1 })) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long, contain at least 1 uppercase letter, 1 lowercase letter, và 1 special character' });
        }
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            const userData = { username, email, password: hash };
            if (avatar) userData.avatar = avatar;
            User.getUserByEmail(email, (err, results) => {
                if (err) {
                    return res.status(500).json({ error: err });
                }

                if (results && results.length > 0) {
                    return res.status(400).json({ error: 'Email already exists' });
                }

                User.createUser(userData, (err, createResults) => {
                    if (err) {
                        return res.status(500).json({ error: err });
                    }
                    res.json({ message: 'User created successfully', data: { id: createResults.insertId } });
                });
            });
        });
    }
};

const updateUser = (id, userData, res, req) => {
    if (Object.keys(userData).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
    }
    User.getUserById(id, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        User.updateUser(id, userData, (err, updateResults) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            res.json({ message: 'User updated successfully', data: updateResults });
        });
    });
};

// Xóa người dùng theo ID
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

// Tạm dừng tài khoản người dùng
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

