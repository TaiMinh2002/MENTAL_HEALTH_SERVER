const db = require('../../config/db');

const Exercise = {
    // Lấy danh sách bài tập với phân trang, tìm kiếm và lọc theo type
    getAllExercises: (page, limit, keyword, type, callback) => {
        const offset = (page - 1) * limit;
        let query = 'SELECT * FROM exercises WHERE deleted_at IS NULL AND title LIKE ?';
        const values = [`%${keyword}%`];

        if (type) {
            query += ' AND type = ?';
            values.push(type);
        }

        query += ' LIMIT ? OFFSET ?';
        values.push(parseInt(limit), offset);

        db.query(query, values, callback);
    },

    // Lấy thông tin bài tập theo ID
    getExerciseById: (id, callback) => {
        db.query('SELECT * FROM exercises WHERE id = ? AND deleted_at IS NULL', [id], callback);
    },

    // Đếm tổng số bài tập theo keyword và type
    countAllExercises: (keyword, type, callback) => {
        let query = 'SELECT COUNT(*) AS total FROM exercises WHERE deleted_at IS NULL AND title LIKE ?';
        const values = [`%${keyword}%`];

        if (type) {
            query += ' AND type = ?';
            values.push(type);
        }

        db.query(query, values, callback);
    },

    // Tạo mới bài tập
    createExercise: (exerciseData, callback) => {
        db.query('INSERT INTO exercises SET ?', exerciseData, callback);
    },

    // Cập nhật bài tập
    updateExercise: (id, exerciseData, callback) => {
        db.query('UPDATE exercises SET ? WHERE id = ?', [exerciseData, id], callback);
    },

    // Xóa bài tập (đánh dấu deleted_at)
    deleteExercise: (id, callback) => {
        const deletedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
        db.query('UPDATE exercises SET deleted_at = ? WHERE id = ?', [deletedAt, id], callback);
    },

    // Kiểm tra tiêu đề bài tập có tồn tại
    checkExerciseTitleExists: (title, callback) => {
        db.query('SELECT * FROM exercises WHERE title = ?', [title], callback);
    },

    // Kiểm tra bài tập có tồn tại
    checkIfExerciseExists: (id, callback) => {
        db.query('SELECT * FROM exercises WHERE id = ?', [id], callback);
    }
};

module.exports = Exercise;
