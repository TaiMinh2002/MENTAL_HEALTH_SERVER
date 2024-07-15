const Exercise = require('../models/exerciseModel');
const bucket = require('../firebase'); // Import Firebase Storage bucket

// Map type to string
const typeToString = (type) => {
    switch (type) {
        case 1:
            return 'Thiền';
        case 2:
            return 'Thở sâu';
        case 3:
            return 'Yoga';
        default:
            return 'Unknown';
    }
};

// Tải tệp lên Firebase Storage
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
                await blob.makePublic(); // Làm cho tệp công khai
                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
                resolve(publicUrl);
            } catch (error) {
                reject(error);
            }
        });

        blobStream.end(buffer);
    });
};

// Lấy tất cả bài tập với phân trang và tìm kiếm theo title
exports.getAllExercises = (req, res) => {
    const { page = 1, limit = 10, keyword = '' } = req.query;
    Exercise.getAllExercises(page, limit, keyword, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        Exercise.countAllExercises(keyword, (err, countResults) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            res.json({
                total: countResults[0].total,
                page: parseInt(page),
                limit: parseInt(limit),
                exercises: results.map(exercise => ({
                    ...exercise,
                    type_string: typeToString(exercise.type),
                    media_url: exercise.media_url
                }))
            });
        });
    });
};

// Lấy chi tiết bài tập theo ID
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
            media_url: results[0].media_url
        });
    });
};

// Tạo mới hoặc cập nhật thông tin bài tập (upsert)
exports.upsertExercise = async (req, res) => {
    const { id } = req.params;
    const { title, description, type } = req.body;
    let media_url = null;

    if (req.file) {
        try {
            media_url = await uploadToFirebase(req.file);
        } catch (error) {
            return res.status(500).json({ error: 'Error uploading file to Firebase' });
        }
    }

    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }
    if (!description) {
        return res.status(400).json({ error: 'Description is required' });
    }
    if (!type) {
        return res.status(400).json({ error: 'Type is required' });
    }
    if (!media_url && !id) {
        return res.status(400).json({ error: 'Media URL is required' });
    }

    if (id) {
        // Update exercise
        const exerciseData = { title, description, type };
        if (media_url) {
            exerciseData.media_url = media_url;
        }

        Exercise.updateExercise(id, exerciseData, (err, updateResults) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            res.json({ message: 'Exercise updated successfully', media_url: exerciseData.media_url });
        });
    } else {
        // Create new exercise
        const exerciseData = { title, description, type, media_url };

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
                res.json({ id: insertResults.insertId, media_url: exerciseData.media_url });
            });
        });
    }
};

// Xóa bài tập theo ID (mark as deleted)
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
