const db = require('../../config/db');

const Expert = {
    getAllExperts: (page, limit, keyword, specialization, callback) => {
        const offset = (page - 1) * limit;
        const query = `SELECT * FROM experts WHERE deleted_at IS NULL AND name LIKE ? AND specialization = ? LIMIT ? OFFSET ?`;
        const values = [`%${keyword}%`, specialization, parseInt(limit), offset];
        db.query(query, values, callback);
    },

    getExpertById: (id, callback) => {
        const query = `
        SELECT 
            e.*, 
            u.id AS user_id 
        FROM 
            experts e
        LEFT JOIN 
            users u 
        ON 
            u.expert_id = e.id
        WHERE 
            e.id = ? AND e.deleted_at IS NULL
    `;

        db.query(query, [id], callback);
    },


    countAllExperts: (keyword, specialization, callback) => {
        const query = `SELECT COUNT(*) AS total FROM experts WHERE deleted_at IS NULL AND name LIKE ? AND specialization = ?`;
        const values = [`%${keyword}%`, specialization];
        db.query(query, values, callback);
    },
};

module.exports = Expert;
