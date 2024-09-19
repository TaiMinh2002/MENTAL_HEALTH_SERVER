const db = require('../../config/db');

// Lưu cuộc hội thoại
const saveConversation = (userId, userMessage, botReply, callback) => {
    const query = 'INSERT INTO conversations (user_id, user_message, bot_reply) VALUES (?, ?, ?)';
    db.query(query, [userId, userMessage, botReply], (err, result) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, result);
    });
};

// Lấy lịch sử cuộc hội thoại của người dùng
const getConversations = (userId, callback) => {
    const query = 'SELECT * FROM conversations WHERE user_id = ? ORDER BY created_at DESC';
    db.query(query, [userId], (err, results) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, results);
    });
};

module.exports = {
    saveConversation,
    getConversations
};
