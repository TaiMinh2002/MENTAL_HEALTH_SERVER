const UserExercise = require('../../models/user/userExerciseModel');

// Lấy tất cả các bài tập của người dùng
exports.getAllUserExercises = (req, res) => {
    UserExercise.getAllUserExercises((err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        res.json(results);
    });
};

// Lấy chi tiết bài tập của người dùng theo ID
exports.getUserExerciseById = (req, res) => {
    const { id } = req.params;
    UserExercise.getUserExerciseById(id, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'User exercise not found' });
        }
        res.json(results[0]);
    });
};

// Tạo mới hoặc cập nhật thông tin bài tập của người dùng (upsert)
exports.upsertUserExercise = (req, res) => {
    const { id } = req.params;
    const { user_id, exercise_id, status, date_completed } = req.body;
    const userExerciseData = { user_id, exercise_id, status, date_completed };

    if (id) {
        UserExercise.getUserExerciseById(id, (err, results) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            if (results.length === 0) {
                return res.status(404).json({ error: 'User exercise not found' });
            }
            UserExercise.updateUserExercise(id, userExerciseData, (err, updateResults) => {
                if (err) {
                    return res.status(500).json({ error: err });
                }
                res.json({ message: 'User exercise updated successfully' });
            });
        });
    } else {
        UserExercise.createUserExercise(userExerciseData, (err, insertResults) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            res.json({ id: insertResults.insertId });
        });
    }
};

// Xóa bài tập của người dùng theo ID
exports.deleteUserExercise = (req, res) => {
    const { id } = req.params;
    UserExercise.deleteUserExercise(id, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        res.json({ message: 'User exercise marked as deleted' });
    });
};
