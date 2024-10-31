const db = require('../../config/db');

const Message = {
    create: (conversation_id, sender_id, message, callback) => {
        const query = `INSERT INTO messages (conversation_id, sender_id, message) VALUES (?, ?, ?)`;
        db.query(query, [conversation_id, sender_id, message], callback);
    },

    getByConversationId: (conversationId, callback) => {
        const query = `SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC`;
        db.query(query, [conversationId], callback);
    }
};

module.exports = Message;
