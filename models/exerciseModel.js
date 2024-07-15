const db = require('../config/db');

const Exercise = {
    getAllExercises: (page, limit, keyword, callback) => {
        const offset = (page - 1) * limit;
        const query = 'SELECT * FROM exercises WHERE deleted_at IS NULL AND title LIKE ? LIMIT ? OFFSET ?';
        const values = [`%${keyword}%`, parseInt(limit), offset];
        db.query(query, values, callback);
    },

    getExerciseById: (id, callback) => {
        db.query('SELECT * FROM exercises WHERE id = ? AND deleted_at IS NULL', [id], callback);
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

    createExercise: (exerciseData, callback) => {
        db.query('INSERT INTO exercises SET ?', exerciseData, callback);
    },

    updateExercise: (id, exerciseData, callback) => {
        db.query('UPDATE exercises SET ? WHERE id = ?', [exerciseData, id], callback);
    },

    deleteExercise: (id, callback) => {
        const deletedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
        db.query('UPDATE exercises SET deleted_at = ? WHERE id = ?', [deletedAt, id], callback);
    },

    checkExerciseTitleExists: (title, callback) => {
        db.query('SELECT * FROM exercises WHERE title = ?', [title], callback);
    },

    checkIfExerciseExists: (id, callback) => {
        db.query('SELECT * FROM exercises WHERE id = ?', [id], callback);
    }
};

module.exports = Exercise;
