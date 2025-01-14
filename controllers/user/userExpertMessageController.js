const UserExpertMessage = require("../../models/user/UserExpertMessageModel");

exports.sendMessage = async (req, res) => {
    const { chat_id, receiver_id, message } = req.query;
    const sender_id = req.user.id;
    if (!chat_id || !receiver_id || !message) {
        return res.status(400).json({ error: "chat_id, receiver_id, and message are required" });
    }

    try {
        const messageId = await UserExpertMessage.create(chat_id, sender_id, receiver_id, message);

        res.json({
            messageId,
            chat_id: parseInt(chat_id),
            sender_id: parseInt(sender_id),
            receiver_id: parseInt(receiver_id),
            message,
            created_at: new Date().toISOString(),
        });
    } catch (err) {
        console.error("Error creating message:", err.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.getMessages = async (req, res) => {
    const { chatId, page = 1, limit = 10 } = req.query;

    if (!chatId) {
        return res.status(400).json({ error: "Chat ID is required" });
    }

    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    const offset = (parsedPage - 1) * parsedLimit;

    try {
        const messages = await UserExpertMessage.getMessagesByChatId(chatId, parsedLimit, offset);

        const total = await UserExpertMessage.countMessagesByChatId(chatId);

        res.json({
            msg: 'success',
            code: 200,
            data: {
                messages: {
                    data: messages,
                    total,
                    per_page: parsedLimit,
                    current_page: parsedPage,
                    last_page: Math.ceil(total / parsedLimit),
                    has_more_pages: parsedPage < Math.ceil(total / parsedLimit),
                },
            },
        });
    } catch (err) {
        console.error("Error fetching messages:", err.message);
        res.status(500).json({ msg: 'error', code: 500, error: "Internal server error" });
    }
};
