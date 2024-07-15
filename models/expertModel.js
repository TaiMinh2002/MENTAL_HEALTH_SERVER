const db = require('../config/db');

const Expert = {
    getAllExperts: (callback) => {
        db.query('SELECT * FROM experts WHERE deleted_at IS NULL', callback);
    },
    getExpertById: (id, callback) => {
        db.query('SELECT * FROM experts WHERE id = ? AND deleted_at IS NULL', [id], callback);
    },
    createExpert: (expertData, callback) => {
        db.query('INSERT INTO experts SET ?', expertData, callback);
    },
    updateExpert: (id, expertData, callback) => {
        db.query('UPDATE experts SET ? WHERE id = ?', [expertData, id], callback);
    },
    deleteExpert: (id, callback) => {
        const deletedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
        db.query('UPDATE experts SET deleted_at = ? WHERE id = ?', [deletedAt, id], callback);
    },
    checkPhoneNumberExists: (phone_number, callback) => {
        db.query('SELECT * FROM experts WHERE phone_number = ? AND deleted_at IS NULL', [phone_number], callback);
    }
};

module.exports = Expert;
