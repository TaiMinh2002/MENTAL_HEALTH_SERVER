const bcrypt = require('bcryptjs');
const validator = require('validator');
const Expert = require('../../models/user/expertModel');
const User = require('../../models/user/userModel');
const bucket = require('../../firebase');
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
                await blob.makePublic();
                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
                resolve(publicUrl);
            } catch (error) {
                reject(error);
            }
        });

        blobStream.end(buffer);
    });
};

exports.getAllExperts = (req, res) => {
    let { page = 1, limit = 10, keyword = '', specialization } = req.query;
    limit = limit ? parseInt(limit) : 10;

    if (!specialization) {
        return res.status(400).json({ error: "Specialization is required" });
    }

    Expert.getAllExperts(page, limit, keyword, parseInt(specialization), (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }

        const expertsWithSpecializationString = results.map((expert) => ({
            ...expert,
            specialization_string: getSpecializationString(expert.specialization),
        }));

        Expert.countAllExperts(keyword, parseInt(specialization), (err, countResults) => {
            if (err) {
                return res.status(500).json({ error: err });
            }

            const total = countResults[0].total;
            const lastPage = Math.ceil(total / limit);

            res.json({
                msg: "success",
                code: 200,
                data: {
                    experts: {
                        data: expertsWithSpecializationString,
                        total,
                        per_page: limit,
                        current_page: parseInt(page),
                        last_page: lastPage,
                        has_more_pages: parseInt(page) < lastPage,
                    },
                },
            });
        });
    });
};

exports.getExpertById = (req, res) => {
    const { id } = req.params;

    Expert.getExpertById(id, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Internal server error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "Expert not found" });
        }

        const expert = {
            ...results[0],
            specialization_string: getSpecializationString(results[0].specialization)
        };

        res.json({
            msg: "success",
            code: 200,
            data: {
                expert
            }
        });
    });
};
