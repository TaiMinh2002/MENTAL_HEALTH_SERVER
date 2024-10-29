const bcrypt = require('bcryptjs');
const validator = require('validator');
const Expert = require('../../models/admin/expertModel');
const User = require('../../models/user/userModel');
const bucket = require('../../firebase'); // Import Firebase Storage bucket
require('dotenv').config();

const getBaseUrl = (req) => {
    const serverIp = process.env.SERVER_IP || 'localhost';
    return req.protocol + '://' + serverIp + ':' + process.env.PORT;
};

const getSpecializationString = (specialization) => {
    switch (specialization) {
        case 1:
            return 'Clinical psychology';
        case 2:
            return 'Psychiatry';
        case 3:
            return 'Counseling';
        case 4:
            return 'Behavioral Therapy';
        case 5:
            return 'Family & Marriage';
        case 6:
            return 'Art & Music';
        default:
            return 'Unknown';
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

// Lấy tất cả chuyên gia với phân trang và tìm kiếm
exports.getAllExperts = (req, res) => {
    let { page = 1, limit, keyword = '' } = req.query;
    limit = limit ? parseInt(limit) : 10;

    Expert.getAllExperts(page, limit, keyword, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }

        const expertsWithSpecializationString = results.map((expert) => ({
            ...expert,
            specialization_string: getSpecializationString(expert.specialization),
        }));

        Expert.countAllExperts(keyword, (err, countResults) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            const total = countResults[0].total;

            res.json({
                page: parseInt(page),
                limit,
                total,
                total_page: Math.ceil(total / limit),
                experts: expertsWithSpecializationString,
            });
        });
    });
};

// Lấy chi tiết chuyên gia theo ID
exports.getExpertById = (req, res) => {
    const { id } = req.params;
    Expert.getExpertById(id, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Expert not found' });
        }

        const expert = results[0];
        res.json(expert);
    });
};

// Tạo mới chuyên gia
exports.createExpert = async (req, res) => {
    const { name, specialization, bio, contact_info, phone_number } = req.body;
    let avatar = null;

    // Kiểm tra nếu có tệp ảnh avatar
    if (req.file) {
        try {
            avatar = await uploadToFirebase(req.file);
        } catch (error) {
            return res.status(500).json({ error: 'Error uploading file to Firebase' });
        }
    }

    // Kiểm tra các trường bắt buộc
    const errors = {};
    if (!name) errors.name = 'Name is required';
    if (!specialization) errors.specialization = 'Specialization is required';
    if (!bio) errors.bio = 'Bio is required';
    if (!contact_info) errors.contact_info = 'Contact info is required';
    if (!phone_number) errors.phone_number = 'Phone number is required';

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
    }

    // Chuyển đổi specialization thành số nếu nó là chuỗi
    const expertData = {
        name,
        specialization: parseInt(specialization, 10),
        bio,
        contact_info,
        phone_number,
    };

    if (avatar) expertData.avatar = avatar;

    try {
        // Kiểm tra số điện thoại đã tồn tại
        Expert.checkPhoneNumberExists(phone_number, async (err, results) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            if (results.length > 0) {
                return res.status(400).json({ error: 'Phone number already exists' });
            }

            // Tạo mới chuyên gia
            Expert.createExpert(expertData, async (err, insertResults) => {
                if (err) {
                    return res.status(500).json({ error: err });
                }

                // Tạo tài khoản user tương ứng
                const password = await bcrypt.hash('Mental@2024', 10);
                const username = name;
                const userData = {
                    expert_id: insertResults.insertId,
                    avatar,
                    phone_number,  // Lưu phone_number vào bảng users
                    username,
                    password,
                    role: 3,
                    email_verified_at: new Date(),
                };

                User.createUser(userData, (err, userResult) => {
                    if (err) {
                        return res.status(500).json({ error: 'Failed to create user for expert' });
                    }
                    res.json({
                        expertId: insertResults.insertId,
                        userId: userResult.insertId,
                        avatar,
                    });
                });
            });
        });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create expert and user' });
    }
};

// Cập nhật thông tin chuyên gia
exports.updateExpert = async (req, res) => {
    const { id } = req.params;
    const { name, specialization, bio, contact_info, phone_number } = req.body;
    let avatar = null;

    // Kiểm tra nếu có tệp ảnh avatar
    if (req.file) {
        try {
            avatar = await uploadToFirebase(req.file);
        } catch (error) {
            return res.status(500).json({ error: 'Error uploading file to Firebase' });
        }
    }

    const expertData = {};
    if (name) expertData.name = name;
    if (specialization) expertData.specialization = specialization;
    if (bio) expertData.bio = bio;
    if (contact_info) expertData.contact_info = contact_info;
    if (phone_number) expertData.phone_number = phone_number;
    if (avatar) expertData.avatar = avatar;

    try {
        // Kiểm tra nếu chuyên gia tồn tại
        Expert.getExpertById(id, async (err, expertResults) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            if (expertResults.length === 0) {
                return res.status(404).json({ error: 'Expert not found' });
            }

            // Cập nhật thông tin chuyên gia
            Expert.updateExpert(id, expertData, async (err, updateResults) => {
                if (err) {
                    return res.status(500).json({ error: err });
                }

                // Cập nhật thông tin trong bảng users nếu có thay đổi phone_number hoặc avatar
                const userData = {};
                if (phone_number) {
                    userData.phone_number = phone_number;  // Cập nhật phone_number
                }
                if (avatar) {
                    userData.avatar = avatar;  // Cập nhật avatar khi có thay đổi avatar
                }

                if (Object.keys(userData).length > 0) {
                    User.updateUserByExpertId(id, userData, (err, userUpdateResults) => {
                        if (err) {
                            return res.status(500).json({ error: 'Failed to update user for expert' });
                        }
                        res.json({
                            message: 'Expert and user updated successfully',
                            avatar: expertData.avatar ? getBaseUrl(req) + expertData.avatar : null,
                        });
                    });
                } else {
                    res.json({
                        message: 'Expert updated successfully',
                        avatar: expertData.avatar ? getBaseUrl(req) + expertData.avatar : null,
                    });
                }
            });
        });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update expert and user' });
    }
};

// Xóa chuyên gia theo ID
exports.deleteExpert = (req, res) => {
    const { id } = req.params;
    Expert.checkIfExpertExists(id, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        if (results.length === 0 || results[0].deleted_at) {
            return res.status(404).json({ error: 'Expert not found' });
        }
        Expert.deleteExpert(id, (err, results) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            res.json({ message: 'Expert marked as deleted' });
        });
    });
};
