const Exercise = require('../../models/admin/exerciseModel');
const { UploadClient } = require('@uploadcare/upload-client');
require('dotenv').config();

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

exports.getAllExercises = async (req, res) => {
    let { page = 1, limit = 10, keyword = '', type } = req.query;
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);
    type = type ? parseInt(type, 10) : null;

    try {
        const exercises = await Exercise.getAllExercises(page, limit, keyword, type);
        const total = await Exercise.countAllExercises(keyword, type);

        res.json({
            total,
            page,
            limit,
            exercises: exercises.map((exercise) => ({
                ...exercise,
                type_string: typeToString(exercise.type),
                media_url: exercise.media_url,
                thumbnail_url: exercise.thumbnail_url,
            })),
        });
    } catch (error) {
        console.error('Error fetching exercises:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getExerciseById = async (req, res) => {
    const { id } = req.params;

    try {
        const exercise = await Exercise.getExerciseById(id);

        if (!exercise) {
            return res.status(404).json({ error: 'Exercise not found' });
        }

        res.json({
            ...exercise,
            type_string: typeToString(exercise.type),
            media_url: exercise.media_url,
            thumbnail_url: exercise.thumbnail_url,
        });
    } catch (error) {
        console.error('Error fetching exercise:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.createExercise = async (req, res) => {
    const { title, description, type } = req.body;

    try {
        let media_url = null;
        let thumbnail_url = null;

        if (req.files?.media_url) {
            media_url = await uploadToUploadcare(req.files.media_url[0]);
        }

        if (req.files?.thumbnail_url) {
            thumbnail_url = await uploadToUploadcare(req.files.thumbnail_url[0]);
        }

        if (!title || !description || !type || !media_url || !thumbnail_url) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const existingExercise = await Exercise.checkExerciseTitleExists(title);
        if (existingExercise) {
            return res.status(400).json({ error: 'Exercise title already exists' });
        }

        const exerciseData = { title, description, type, media_url, thumbnail_url };
        const exerciseId = await Exercise.createExercise(exerciseData);

        res.json({ id: exerciseId, media_url, thumbnail_url });
    } catch (error) {
        console.error('Error creating exercise:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateExercise = async (req, res) => {
    const { id } = req.params;
    const { title, description, type } = req.body;

    try {
        let media_url = null;
        let thumbnail_url = null;

        if (req.files?.media_url) {
            media_url = await uploadToUploadcare(req.files.media_url[0]);
        }

        if (req.files?.thumbnail_url) {
            thumbnail_url = await uploadToUploadcare(req.files.thumbnail_url[0]);
        }

        const existingExercise = await Exercise.getExerciseById(id);
        if (!existingExercise) {
            return res.status(404).json({ error: 'Exercise not found' });
        }

        const exerciseData = { title, description, type, media_url, thumbnail_url };
        await Exercise.updateExercise(id, exerciseData);

        res.json({ message: 'Exercise updated successfully', media_url, thumbnail_url });
    } catch (error) {
        console.error('Error updating exercise:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteExercise = async (req, res) => {
    const { id } = req.params;

    try {
        const existingExercise = await Exercise.checkIfExerciseExists(id);
        if (!existingExercise) {
            return res.status(404).json({ error: 'Exercise not found' });
        }

        await Exercise.deleteExercise(id);
        res.json({ message: 'Exercise marked as deleted' });
    } catch (error) {
        console.error('Error deleting exercise:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
