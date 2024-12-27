const UserExpertChat = require("../../models/user/UserExpertChatModel");
const db = require("../../config/db");

exports.createChat = (req, res) => {
    const { expert_id } = req.query; // Lấy expert_id từ query
    const user_id = req.user.id; // Lấy user_id từ token

    if (!expert_id) {
        return res.status(400).json({ error: "expert_id is required" });
    }

    UserExpertChat.findOrCreate(user_id, expert_id, (err, chat) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Internal server error" });
        }

        // Trả về thông tin chat với các trường int
        res.json({
            chat_id: parseInt(chat.id),
            user_id: parseInt(chat.user_id),
            expert_id: parseInt(chat.expert_id),
            created_at: chat.created_at,
        });
    });
};

exports.getChats = (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page > 0 ? page - 1 : 0) * limit;
    const user_id = req.user.id;

    UserExpertChat.getChatsByUserId(user_id, limit, offset, (err, results) => {
        if (err) {
            console.error("Database error in getChatsByUserId:", err);
            return res.status(500).json({ error: "Internal server error" });
        }

        UserExpertChat.countChatsByUserId(user_id, (err, countResults) => {
            if (err) {
                console.error("Database error in countChatsByUserId:", err);
                return res.status(500).json({ error: "Internal server error" });
            }

            const total = countResults[0]?.total || 0;
            const totalPages = Math.ceil(total / limit);

            const formattedResults = results.map(chat => ({
                chat_id: parseInt(chat.chat_id),
                user_id: parseInt(chat.user_id),
                expert_id: parseInt(chat.expert_id),
                user_name: chat.user_name,
                user_avatar: chat.user_avatar,
                expert_name: chat.expert_name,
                expert_avatar: chat.expert_avatar,
                latest_message: chat.latest_message || null, // Tin nhắn mới nhất
                created_at: chat.created_at,
            }));

            res.json({
                data: formattedResults,
                total: total,
                per_page: parseInt(limit),
                current_page: parseInt(page),
                last_page: totalPages,
                has_more_pages: parseInt(page) < totalPages,
            });
        });
    });
};
