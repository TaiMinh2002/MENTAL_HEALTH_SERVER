const UserExpertChat = require("../../models/user/UserExpertChatModel");

exports.createChat = async (req, res) => {
    const { expert_id } = req.query;
    const user_id = req.user.id;

    if (!expert_id) {
        return res.status(400).json({ error: "expert_id is required" });
    }

    try {
        const chat = await UserExpertChat.findOrCreate(user_id, expert_id);

        res.json({
            chat_id: parseInt(chat.id),
            user_id: parseInt(chat.user_id),
            expert_id: parseInt(chat.expert_id),
            created_at: chat.created_at,
        });
    } catch (err) {
        console.error("Error creating chat:", err.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.getChats = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    const offset = (parsedPage - 1) * parsedLimit;
    const user_id = req.user.id;

    try {
        const chats = await UserExpertChat.getChatsByUserId(user_id, parsedLimit, offset);

        const total = await UserExpertChat.countChatsByUserId(user_id);

        const formattedResults = chats.map((chat) => ({
            chat_id: parseInt(chat.chat_id),
            user_id: parseInt(chat.user_id),
            expert_id: parseInt(chat.expert_id),
            user_name: chat.user_name,
            user_avatar: chat.user_avatar,
            expert_name: chat.expert_name,
            expert_avatar: chat.expert_avatar,
            latest_message: chat.latest_message || null,
            last_time: chat.last_time || null,
            created_at: chat.created_at,
        }));

        const lastPage = Math.ceil(total / parsedLimit);
        const hasMorePages = parsedPage < lastPage;

        res.json({
            msg: 'success',
            code: 200,
            data: {
                expert_chats: {
                    data: formattedResults,
                    total,
                    per_page: parsedLimit,
                    current_page: parsedPage,
                    last_page: lastPage,
                    has_more_pages: hasMorePages,
                },
            },
        });
    } catch (err) {
        console.error('Error fetching chats:', err.message);
        res.status(500).json({ msg: 'error', code: 500, error: 'Internal server error' });
    }
};
