const db = require('../../config/db');

const Conversation = {
    create: (user1_id, user2_id, callback) => {
        const query = `INSERT INTO conversations (user1_id, user2_id) VALUES (?, ?)`;
        db.query(query, [user1_id, user2_id], callback);
    },

    getByUserIdWithPagination: (userId, limit, offset, callback) => {
        const query = `
            SELECT conversations.*, 
                   u1.username AS user1_name,
                   u2.username AS user2_name
            FROM conversations
            LEFT JOIN users AS u1 ON conversations.user1_id = u1.id
            LEFT JOIN users AS u2 ON conversations.user2_id = u2.id
            WHERE (conversations.user1_id = ? OR conversations.user2_id = ?)
            LIMIT ? OFFSET ?`;

        const values = [userId, userId, parseInt(limit), parseInt(offset)];
        db.query(query, values, callback);
    },

    countByUserId: (userId, callback) => {
        const query = `
            SELECT COUNT(*) AS total
            FROM conversations
            WHERE conversations.user1_id = ? OR conversations.user2_id = ?`;

        const values = [userId, userId];
        db.query(query, values, callback);
    }
};

module.exports = Conversation;
