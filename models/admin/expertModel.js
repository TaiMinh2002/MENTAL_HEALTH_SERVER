const db = require('../../config/db');

const Expert = {
    getAllExperts: (page, limit, keyword, callback) => {
        const offset = (page - 1) * limit;
        const query = `SELECT * FROM experts WHERE deleted_at IS NULL AND name LIKE ? LIMIT ? OFFSET ?`;
        const values = [`%${keyword}%`, parseInt(limit), offset];
        db.query(query, values, callback);
    },

    getExpertById: (id, callback) => {
        db.query(`SELECT * FROM experts WHERE id = ? AND deleted_at IS NULL`, [id], callback);
    },

    createExpert: (expertData, callback) => {
        db.query(`INSERT INTO experts SET ?`, expertData, callback);
    },

    updateExpert: (id, expertData, callback) => {
        db.query(`UPDATE experts SET ? WHERE id = ?`, [expertData, id], callback);
    },

    deleteExpert: (id, callback) => {
        const deletedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
        db.query(`UPDATE experts SET deleted_at = ? WHERE id = ?`, [deletedAt, id], callback);
    },

    checkIfExpertExists: (id, callback) => {
        db.query(`SELECT * FROM experts WHERE id = ?`, [id], callback);
    },

    checkPhoneNumberExists: (phone_number, callback) => {
        db.query(`SELECT id FROM experts WHERE phone_number = ? AND deleted_at IS NULL`, [phone_number], callback);
    },

    countAllExperts: (keyword, callback) => {
        const query = `SELECT COUNT(*) AS total FROM experts WHERE deleted_at IS NULL AND name LIKE ?`;
        const value = `%${keyword}%`;
        db.query(query, [value], callback);
    }
};

module.exports = Expert;
