const Exercise = require('../../models/admin/exerciseModel');
const bucket = require('../../firebase'); // Import Firebase Storage bucket

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
    let { page = 1, limit, keyword = '' } = req.query;
    limit = limit ? parseInt(limit) : 10; // Chỉ mặc định là 10 nếu không truyền limit vào params

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
                limit,
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

exports.createExercise = async (req, res) => {
    const { title, description, type } = req.body;
    let media_url = null;

    // Kiểm tra nếu có tệp media
    if (req.file) {
        try {
            media_url = await uploadToFirebase(req.file);
        } catch (error) {
            return res.status(500).json({ error: 'Error uploading file to Firebase' });
        }
    }

    // Kiểm tra các trường bắt buộc
    const errors = {};
    if (!title) errors.title = 'Title is required';
    if (!description) errors.description = 'Description is required';
    if (!type) errors.type = 'Type is required';
    if (!media_url) errors.media_url = 'Media URL is required';

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
    }

    const exerciseData = { title, description, type, media_url };

    // Kiểm tra tiêu đề bài tập đã tồn tại
    Exercise.checkExerciseTitleExists(title, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        if (results.length > 0) {
            return res.status(400).json({ error: 'Exercise title already exists' });
        }

        // Tạo mới bài tập
        Exercise.createExercise(exerciseData, (err, insertResults) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            res.json({ id: insertResults.insertId, media_url: exerciseData.media_url });
        });
    });
};

exports.updateExercise = async (req, res) => {
    const { id } = req.params;
    const { title, description, type } = req.body;
    let media_url = null;

    // Kiểm tra nếu có tệp media
    if (req.file) {
        try {
            media_url = await uploadToFirebase(req.file);
        } catch (error) {
            return res.status(500).json({ error: 'Error uploading file to Firebase' });
        }
    }

    const exerciseData = {};
    if (title) exerciseData.title = title;
    if (description) exerciseData.description = description;
    if (type) exerciseData.type = type;
    if (media_url) exerciseData.media_url = media_url;

    // Kiểm tra nếu bài tập tồn tại
    Exercise.getExerciseById(id, (err, exerciseResults) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        if (exerciseResults.length === 0) {
            return res.status(404).json({ error: 'Exercise not found' });
        }

        // Cập nhật bài tập
        Exercise.updateExercise(id, exerciseData, (err, updateResults) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            res.json({
                message: 'Exercise updated successfully',
                media_url: exerciseData.media_url
            });
        });
    });
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
