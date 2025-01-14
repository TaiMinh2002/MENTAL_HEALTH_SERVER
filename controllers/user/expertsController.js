const bcrypt = require('bcryptjs');
const validator = require('validator');
const Expert = require('../../models/user/expertModel');
const User = require('../../models/user/userModel');
require('dotenv').config();

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
    let { page = 1, limit = 10, keyword = '', specialization } = req.query;
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    if (!specialization) {
        return res.status(400).json({ error: "Specialization is required" });
    }

    try {
        const experts = await Expert.getAllExperts(page, limit, keyword, parseInt(specialization));

        const total = await Expert.countAllExperts(keyword, parseInt(specialization));

        const formattedExperts = experts.map((expert) => ({
            ...expert,
            specialization_string: getSpecializationString(expert.specialization),
        }));

        const lastPage = Math.ceil(total / limit);

        res.json({
            msg: "success",
            code: 200,
            data: {
                experts: {
                    data: formattedExperts,
                    total,
                    per_page: limit,
                    current_page: page,
                    last_page: lastPage,
                    has_more_pages: page < lastPage,
                },
            },
        });
    } catch (err) {
        console.error('Error fetching experts:', err);
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

        const formattedExpert = {
            ...expert,
            specialization_string: getSpecializationString(expert.specialization),
        };

        res.json({
            msg: "success",
            code: 200,
            data: { expert: formattedExpert },
        });
    } catch (err) {
        console.error('Error fetching expert:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
