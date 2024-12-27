const db = require("../../config/db");

const UserExpertMessage = {
  create: (chat_id, sender_id, receiver_id, message, callback) => {
    const query = `
      INSERT INTO user_expert_messages (chat_id, sender_id, receiver_id, message)
      VALUES (?, ?, ?, ?)
    `;
    db.query(query, [chat_id, sender_id, receiver_id, message], callback);
  },

  getMessagesByChatId: (chatId, callback) => {
    const query = `
      SELECT m.*, 
             u.username AS sender, 
             r.username AS receiver
      FROM user_expert_messages m
      LEFT JOIN users u ON m.sender_id = u.id
      LEFT JOIN users r ON m.receiver_id = r.id
      WHERE m.chat_id = ?
      ORDER BY m.created_at ASC
    `;
    db.query(query, [chatId], callback);
  },
};

module.exports = UserExpertMessage;
