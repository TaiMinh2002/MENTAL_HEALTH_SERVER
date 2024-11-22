const db = require('../../config/db');

const Expert = {
    getAllExperts: (page, limit, keyword, specialization, callback) => {
        const offset = (page - 1) * limit;
        const query = `SELECT * FROM experts WHERE deleted_at IS NULL AND name LIKE ? AND specialization = ? LIMIT ? OFFSET ?`;
        const values = [`%${keyword}%`, specialization, parseInt(limit), offset];
        db.query(query, values, callback);
    },

    getExpertById: (id, callback) => {
        db.query(`SELECT * FROM experts WHERE id = ? AND deleted_at IS NULL`, [id], callback);
    },

    countAllExperts: (keyword, specialization, callback) => {
        const query = `SELECT COUNT(*) AS total FROM experts WHERE deleted_at IS NULL AND name LIKE ? AND specialization = ?`;
        const values = [`%${keyword}%`, specialization];
        db.query(query, values, callback);
    },
};

module.exports = Expert;
