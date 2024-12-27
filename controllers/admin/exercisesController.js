const Exercise = require('../../models/admin/exerciseModel');
const { UploadClient } = require('@uploadcare/upload-client');
require('dotenv').config();

// Map type to string
const typeToString = (type) => {
    switch (type) {
        case 1:
            return 'Meditation';
        case 2:
            return 'Deep Breathing';
        case 3:
            return 'Yoga';
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

exports.getAllExercises = (req, res) => {
    let { page = 1, limit, keyword = '', type } = req.query;
    limit = limit ? parseInt(limit) : 10;
    type = type ? parseInt(type) : null;

    Exercise.getAllExercises(page, limit, keyword, type, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        Exercise.countAllExercises(keyword, type, (err, countResults) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            res.json({
                total: countResults[0].total,
                page: parseInt(page),
                limit,
                exercises: results.map(exercise => ({
                    ...exercise,
                    type_string: typeToString(exercise.type),
                    media_url: exercise.media_url,
                    thumbnail_url: exercise.thumbnail_url
                }))
            });
        });
    });
};

exports.getExerciseById = (req, res) => {
    const { id } = req.params;
    Exercise.getExerciseById(id, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Exercise not found' });
        }
        res.json({
            ...results[0],
            type_string: typeToString(results[0].type),
            media_url: results[0].media_url,
            thumbnail_url: results[0].thumbnail_url
        });
    });
};

exports.createExercise = async (req, res) => {
    const { title, description, type } = req.body;
    let media_url = null;
    let thumbnail_url = null;

    try {
        // Upload video nếu có
        if (req.files && req.files.media_url) {
            media_url = await uploadToUploadcare(req.files.media_url[0]);
        }

        // Upload ảnh thumbnail nếu có
        if (req.files && req.files.thumbnail_url) {
            thumbnail_url = await uploadToUploadcare(req.files.thumbnail_url[0]);
        }

        // Kiểm tra dữ liệu đầu vào
        const errors = {};
        if (!title) errors.title = 'Title is required';
        if (!description) errors.description = 'Description is required';
        if (!type) errors.type = 'Type is required';
        if (!media_url) errors.media_url = 'Media URL is required';
        if (!thumbnail_url) errors.thumbnail_url = 'Thumbnail URL is required';

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ errors });
        }

        // Tạo dữ liệu bài tập
        const exerciseData = { title, description, type, media_url, thumbnail_url };

        Exercise.checkExerciseTitleExists(title, (err, results) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            if (results.length > 0) {
                return res.status(400).json({ error: 'Exercise title already exists' });
            }

            Exercise.createExercise(exerciseData, (err, insertResults) => {
                if (err) {
                    return res.status(500).json({ error: err });
                }
                res.json({ id: insertResults.insertId, media_url, thumbnail_url });
            });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateExercise = async (req, res) => {
    const { id } = req.params;
    const { title, description, type } = req.body;
    let media_url = null;
    let thumbnail_url = null;

    try {
        // Upload video nếu có
        if (req.files && req.files.media_url) {
            media_url = await uploadToUploadcare(req.files.media_url[0]);
        }

        // Upload ảnh thumbnail nếu có
        if (req.files && req.files.thumbnail_url) {
            thumbnail_url = await uploadToUploadcare(req.files.thumbnail_url[0]);
        }

        // Cập nhật dữ liệu bài tập
        const exerciseData = {};
        if (title) exerciseData.title = title;
        if (description) exerciseData.description = description;
        if (type) exerciseData.type = type;
        if (media_url) exerciseData.media_url = media_url;
        if (thumbnail_url) exerciseData.thumbnail_url = thumbnail_url;

        Exercise.getExerciseById(id, (err, exerciseResults) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            if (exerciseResults.length === 0) {
                return res.status(404).json({ error: 'Exercise not found' });
            }

            Exercise.updateExercise(id, exerciseData, (err, updateResults) => {
                if (err) {
                    return res.status(500).json({ error: err });
                }
                res.json({
                    message: 'Exercise updated successfully',
                    media_url,
                    thumbnail_url,
                });
            });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteExercise = (req, res) => {
    const { id } = req.params;
    Exercise.checkIfExerciseExists(id, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        if (results.length === 0 || results[0].deleted_at) {
            return res.status(404).json({ error: 'Exercise not found' });
        }
        Exercise.deleteExercise(id, (err, deleteResults) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            res.json({ message: 'Exercise marked as deleted' });
        });
    });
};
