const Conversation = require('../../models/user/conversationModel');
const Message = require('../../models/user/messageModel');

exports.createConversation = (req, res) => {
    const user1_id = req.user.id; // Lấy ID người dùng đang đăng nhập từ token
    const { user2_id } = req.body;

    Conversation.create(user1_id, user2_id, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
        res.json({ message: "Conversation created successfully", conversationId: results.insertId });
    });
};

exports.getConversations = (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page > 0 ? page - 1 : 0) * limit;

    Conversation.getByUserIdWithPagination(userId, limit, offset, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Internal server error" });
        }

        // Đếm tổng số cuộc trò chuyện
        Conversation.countByUserId(userId, (err, countResults) => {
            if (err) {
                return res.status(500).json({ error: "Internal server error" });
            }

            const total = countResults[0].total;
            const totalPages = Math.ceil(total / limit);

            res.json({
                data: results,
                total: total,
                per_page: results.length,
                current_page: parseInt(page),
                last_page: totalPages,
                has_more_pages: parseInt(page) < totalPages
            });
        });
    });
};

exports.sendMessage = (req, res) => {
    const { conversation_id, message } = req.body;
    const sender_id = req.user.id; // Lấy ID người dùng từ token đã xác thực

    Message.create(conversation_id, sender_id, message, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
        res.json({ message: "Message sent successfully", messageId: results.insertId });
    });
};

exports.getMessages = (req, res) => {
    const { conversationId } = req.params;

    Message.getByConversationId(conversationId, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
        res.json(results);
    });
};
