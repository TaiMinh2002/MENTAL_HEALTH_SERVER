const bcrypt = require('bcryptjs');
const Expert = require('../../models/admin/expertModel');
const User = require('../../models/user/userModel');
const { UploadClient } = require('@uploadcare/upload-client');
require('dotenv').config();

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
        case 7:
            return 'Elderly';
        default:
            return 'Unknown';
    }
};

exports.getAllExperts = async (req, res) => {
    let { page = 1, limit = 10, keyword = '' } = req.query;
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    try {
        const experts = await Expert.getAllExperts(page, limit, keyword);
        const total = await Expert.countAllExperts(keyword);

        const expertsWithSpecialization = experts.map(expert => ({
            ...expert,
            specialization_string: getSpecializationString(expert.specialization),
        }));

        res.json({ page, limit, total, experts: expertsWithSpecialization });
    } catch (error) {
        console.error('Error fetching experts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getExpertById = async (req, res) => {
    const { id } = req.params;

    try {
        const expert = await Expert.getExpertById(id);
        if (!expert) {
            return res.status(404).json({ error: 'Expert not found' });
        }
        res.json(expert);
    } catch (error) {
        console.error('Error fetching expert:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.createExpert = async (req, res) => {
    const { name, specialization, bio, contact_info, phone_number } = req.body;
    let avatar = null;

    try {
        if (req.files?.avatar) {
            avatar = await uploadToUploadcare(req.files.avatar[0]);
        }

        const existingPhoneNumber = await Expert.checkPhoneNumberExists(phone_number);
        if (existingPhoneNumber) {
            return res.status(400).json({ error: 'Phone number already exists' });
        }

        const expertData = { name, specialization, bio, contact_info, phone_number, avatar };
        const expertId = await Expert.createExpert(expertData);

        const password = await bcrypt.hash('Mental@2024', 10);
        const userData = {
            expert_id: expertId,
            avatar,
            phone_number,
            username: name,
            password,
            role: 3,
            email_verified_at: new Date(),
        };

        const userId = await User.createUser(userData);
        res.json({ expertId, userId, avatar });
    } catch (error) {
        console.error('Error creating expert:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateExpert = async (req, res) => {
    const { id } = req.params;
    const { name, specialization, bio, contact_info, phone_number } = req.body;
    let avatar = null;

    try {
        if (req.files?.avatar) {
            avatar = await uploadToUploadcare(req.files.avatar[0]);
        }

        const expert = await Expert.getExpertById(id);
        if (!expert) {
            return res.status(404).json({ error: 'Expert not found' });
        }

        const expertData = { name, specialization, bio, contact_info, phone_number, avatar };
        await Expert.updateExpert(id, expertData);

        res.json({ message: 'Expert updated successfully', avatar });
    } catch (error) {
        console.error('Error updating expert:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteExpert = async (req, res) => {
    const { id } = req.params;

    try {
        const expert = await Expert.checkIfExpertExists(id);
        if (!expert) {
            return res.status(404).json({ error: 'Expert not found' });
        }

        await Expert.deleteExpert(id);
        res.json({ message: 'Expert marked as deleted' });
    } catch (error) {
        console.error('Error deleting expert:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
