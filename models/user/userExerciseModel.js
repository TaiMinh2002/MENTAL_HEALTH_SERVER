const db = require('../../config/db');

const UserExercise = {
    getAllUserExercises: (callback) => {
        db.query('SELECT * FROM user_exercises WHERE deleted_at IS NULL', callback);
    },
    getUserExerciseById: (id, callback) => {
        db.query('SELECT * FROM user_exercises WHERE id = ? AND deleted_at IS NULL', [id], callback);
    },
    createUserExercise: (userExerciseData, callback) => {
        db.query('INSERT INTO user_exercises SET ?', userExerciseData, callback);
    },
    updateUserExercise: (id, userExerciseData, callback) => {
        db.query('UPDATE user_exercises SET ? WHERE id = ?', [userExerciseData, id], callback);
    },
    deleteUserExercise: (id, callback) => {
        const deletedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
        db.query('UPDATE user_exercises SET deleted_at = ? WHERE id = ?', [deletedAt, id], callback);
    }
};

module.exports = UserExercise;
