const bcrypt = require('bcryptjs');
const validator = require('validator');
const Expert = require('../../models/admin/expertModel');
const User = require('../../models/user/userModel');
const { UploadClient } = require('@uploadcare/upload-client');
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

exports.getAllExperts = (req, res) => {
    let { page = 1, limit, keyword = '' } = req.query;
    limit = limit ? parseInt(limit) : 10;

    Expert.getAllExperts(page, limit, keyword, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }

        const expertsWithSpecializationString = results.map((expert) => ({
            ...expert,
            avatar: expert.avatar || null,
        }));

        Expert.countAllExperts(keyword, (err, countResults) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            res.json({
                page: parseInt(page),
                limit,
                total: countResults[0].total,
                experts: expertsWithSpecializationString,
            });
        });
    });
};

exports.getExpertById = (req, res) => {
    const { id } = req.params;
    Expert.getExpertById(id, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Expert not found' });
        }
        res.json(results[0]);
    });
};

exports.createExpert = async (req, res) => {
    const { name, specialization, bio, contact_info, phone_number } = req.body;
    let avatar = null;

    // Xử lý upload avatar
    if (req.files && req.files.avatar) {
        try {
            avatar = await uploadToUploadcare(req.files.avatar[0]);
        } catch (error) {
            return res.status(500).json({ error: 'Error uploading avatar to Uploadcare' });
        }
    }

    // Kiểm tra dữ liệu đầu vào
    const errors = {};
    if (!name) errors.name = 'Name is required';
    if (!specialization) errors.specialization = 'Specialization is required';
    if (!bio) errors.bio = 'Bio is required';
    if (!contact_info) errors.contact_info = 'Contact info is required';
    if (!phone_number) errors.phone_number = 'Phone number is required';

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
    }

    const expertData = { name, specialization, bio, contact_info, phone_number, avatar };

    try {
        Expert.checkPhoneNumberExists(phone_number, (err, results) => {
            if (err) return res.status(500).json({ error: err });
            if (results.length > 0) return res.status(400).json({ error: 'Phone number already exists' });

            Expert.createExpert(expertData, async (err, insertResults) => {
                if (err) return res.status(500).json({ error: err });

                const password = await bcrypt.hash('Mental@2024', 10);
                const userData = {
                    expert_id: insertResults.insertId,
                    avatar,
                    phone_number,
                    username: name,
                    password,
                    role: 3,
                    email_verified_at: new Date(),
                };

                User.createUser(userData, (err, userResult) => {
                    if (err) return res.status(500).json({ error: 'Failed to create user for expert' });
                    res.json({
                        expertId: insertResults.insertId,
                        userId: userResult.insertId,
                        avatar,
                    });
                });
            });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateExpert = async (req, res) => {
    const { id } = req.params;
    const { name, specialization, bio, contact_info, phone_number } = req.body;
    let avatar = null;

    // Xử lý upload avatar
    if (req.files && req.files.avatar) {
        try {
            avatar = await uploadToUploadcare(req.files.avatar[0]);
        } catch (error) {
            return res.status(500).json({ error: 'Error uploading avatar to Uploadcare' });
        }
    }

    const expertData = { name, specialization, bio, contact_info, phone_number, avatar };

    try {
        Expert.getExpertById(id, (err, expertResults) => {
            if (err) return res.status(500).json({ error: err });
            if (expertResults.length === 0) return res.status(404).json({ error: 'Expert not found' });

            Expert.updateExpert(id, expertData, (err, updateResults) => {
                if (err) return res.status(500).json({ error: err });
                res.json({ message: 'Expert updated successfully', avatar });
            });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteExpert = (req, res) => {
    const { id } = req.params;
    Expert.checkIfExpertExists(id, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        if (results.length === 0 || results[0].deleted_at) return res.status(404).json({ error: 'Expert not found' });

        Expert.deleteExpert(id, (err) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: 'Expert marked as deleted' });
        });
    });
};
