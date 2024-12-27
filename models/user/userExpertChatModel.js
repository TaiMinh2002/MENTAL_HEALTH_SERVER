const db = require("../../config/db");

const UserExpertChat = {
    findOrCreate: (user_id, expert_id, callback) => {
        // Kiểm tra expert_id trong bảng users
        const checkExpertQuery = `
            SELECT id FROM users WHERE expert_id = ?
        `;
        db.query(checkExpertQuery, [expert_id], (err, results) => {
            if (err) return callback(err);
            if (results.length === 0) {
                return callback(new Error("Expert not found"));
            }

            const resolvedExpertId = results[0].id;

            // Kiểm tra nếu đã tồn tại chat
            const findChatQuery = `
                SELECT * FROM user_expert_chats
                WHERE user_id = ? AND expert_id = ?
            `;
            db.query(findChatQuery, [user_id, resolvedExpertId], (err, chatResults) => {
                if (err) return callback(err);

                if (chatResults.length > 0) {
                    return callback(null, chatResults[0]);
                }

                // Tạo mới nếu chưa tồn tại
                const createChatQuery = `
                    INSERT INTO user_expert_chats (user_id, expert_id)
                    VALUES (?, ?)
                `;
                db.query(createChatQuery, [user_id, resolvedExpertId], (err, result) => {
                    if (err) return callback(err);
                    callback(null, { id: result.insertId, user_id, expert_id: resolvedExpertId });
                });
            });
        });
    },

    getChatsByUserId: (user_id, limit, offset, callback) => {
        const query = `
            SELECT 
                c.id AS chat_id, 
                c.user_id, 
                c.expert_id, 
                u1.username AS user_name, 
                u1.avatar AS user_avatar, 
                e.name AS expert_name, 
                e.avatar AS expert_avatar, 
                c.created_at,
                (SELECT m.message 
                 FROM user_expert_messages m 
                 WHERE m.chat_id = c.id 
                 ORDER BY m.created_at DESC 
                 LIMIT 1) AS latest_message
            FROM user_expert_chats c
            LEFT JOIN users u1 ON c.user_id = u1.id
            LEFT JOIN users u2 ON c.expert_id = u2.id
            LEFT JOIN experts e ON u2.expert_id = e.id
            WHERE c.user_id = ? OR c.expert_id = ?
            ORDER BY c.created_at DESC
            LIMIT ? OFFSET ?
        `;
        db.query(query, [user_id, user_id, parseInt(limit), parseInt(offset)], callback);
    },

    // Đếm tổng số chat theo user_id
    countChatsByUserId: (user_id, callback) => {
        const query = `
            SELECT COUNT(*) AS total
            FROM user_expert_chats c
            WHERE c.user_id = ? OR c.expert_id = ?
        `;
        db.query(query, [user_id, user_id], callback);
    },
};

module.exports = UserExpertChat;
