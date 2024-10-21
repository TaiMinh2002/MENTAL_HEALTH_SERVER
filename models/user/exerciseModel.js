const db = require('../../config/db');

const Exercise = {
    getAllExercises: (page, limit, keyword, callback) => {
        const offset = (page - 1) * limit;
        const query = 'SELECT * FROM exercises WHERE deleted_at IS NULL AND title LIKE ? LIMIT ? OFFSET ?';
        const values = [`%${keyword}%`, parseInt(limit), offset];
        db.query(query, values, callback);
    },

    countAllExercises: (keyword, callback) => {
        const query = 'SELECT COUNT(*) AS total FROM exercises WHERE deleted_at IS NULL AND title LIKE ?';
        const value = `%${keyword}%`;
        db.query(query, [value], (err, results) => {
            if (err) {
                callback(err);
            } else {
                callback(null, results);
            }
        });
    },
}

module.exports = Exercise;