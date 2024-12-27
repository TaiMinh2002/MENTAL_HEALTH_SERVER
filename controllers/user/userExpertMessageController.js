const UserExpertMessage = require("../../models/user/UserExpertMessageModel");
const db = require("../../config/db");

exports.sendMessage = (req, res) => {
    const { chat_id, receiver_id, message } = req.query; // Lấy dữ liệu từ query params
    const sender_id = req.user.id; // Lấy ID của người gửi từ token

    // Kiểm tra bắt buộc chat_id, receiver_id và message
    if (!chat_id || !receiver_id || !message) {
        return res.status(400).json({ error: "chat_id, receiver_id, and message are required" });
    }

    // Lưu tin nhắn vào database
    UserExpertMessage.create(chat_id, sender_id, receiver_id, message, (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Internal server error" });
        }

        // Trả về thông tin tin nhắn đã lưu
        res.json({
            messageId: result.insertId,
            chat_id: parseInt(chat_id),
            sender_id: parseInt(sender_id),
            receiver_id: parseInt(receiver_id),
            message,
            created_at: new Date().toISOString(), // Lưu dạng UTC ISO
        });

    });
};

exports.getMessages = (req, res) => {
    const { chatId } = req.query;

    if (!chatId) {
        return res.status(400).json({ error: "Chat ID is required" });
    }

    console.log("Fetching messages for chatId:", chatId);

    UserExpertMessage.getMessagesByChatId(chatId, (err, messages) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Internal server error" });
        }

        // Bọc danh sách tin nhắn trong một đối tượng JSON
        res.json({
            message: "Conversation history retrieved successfully",
            data: messages,
        });
    });
};
