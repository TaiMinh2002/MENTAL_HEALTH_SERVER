const bcrypt = require('bcryptjs');
const validator = require('validator');
const Expert = require('../models/expertModel');
const bucket = require('../firebase'); // Import Firebase Storage bucket
require('dotenv').config();

const getBaseUrl = (req) => {
    const serverIp = process.env.SERVER_IP || 'localhost';
    return req.protocol + '://' + serverIp + ':' + process.env.PORT;
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
    const { page = 1, limit = 10, keyword = '' } = req.query;
    Expert.getAllExperts(page, limit, keyword, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        Expert.countAllExperts(keyword, (err, countResults) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            const total = countResults[0].total;

            res.json({
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                total_page: Math.ceil(total / limit),
                experts: results,
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

// Tạo mới hoặc cập nhật thông tin chuyên gia (upsert)
exports.upsertExpert = async (req, res) => {
    const { id } = req.params;
    const { name, specialization, bio, contact_info, phone_number } = req.body;

    let avatar = null;
    if (req.file) {
        try {
            avatar = await uploadToFirebase(req.file);
        } catch (error) {
            return res.status(500).json({ error: 'Error uploading file to Firebase' });
        }
    }

    if (id) {
        const expertData = {};
        if (name) expertData.name = name;
        if (specialization) expertData.specialization = specialization;
        if (bio) expertData.bio = bio;
        if (contact_info) expertData.contact_info = contact_info;
        if (phone_number) expertData.phone_number = phone_number;
        if (avatar) expertData.avatar = avatar;

        Expert.getExpertById(id, (err, results) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            if (results.length === 0) {
                return res.status(404).json({ error: 'Expert not found' });
            }
            Expert.checkPhoneNumberExists(phone_number, (err, results) => {
                if (err) {
                    return res.status(500).json({ error: err });
                }
                if (results.length > 0 && results[0].id !== parseInt(id)) {
                    return res.status(400).json({ error: 'Phone number already exists' });
                }
                Expert.updateExpert(id, expertData, (err, updateResults) => {
                    if (err) {
                        return res.status(500).json({ error: err });
                    }
                    res.json({ message: 'Expert updated successfully', avatar: expertData.avatar ? getBaseUrl(req) + expertData.avatar : null });
                });
            });
        });
    } else {
        const errors = {};
        if (!name) errors.name = 'Name is required';
        if (!specialization) errors.specialization = 'Specialization is required';
        if (!bio) errors.bio = 'Bio is required';
        if (!contact_info) errors.contact_info = 'Contact info is required';
        if (!phone_number) errors.phone_number = 'Phone number is required';

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ errors });
        }
        const expertData = { name, specialization, bio, contact_info, phone_number };
        if (avatar) expertData.avatar = avatar;

        Expert.checkPhoneNumberExists(phone_number, (err, results) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            if (results.length > 0) {
                return res.status(400).json({ error: 'Phone number already exists' });
            }
            Expert.createExpert(expertData, (err, insertResults) => {
                if (err) {
                    return res.status(500).json({ error: err });
                }
                res.json({ id: insertResults.insertId, avatar });
            });
        });
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
