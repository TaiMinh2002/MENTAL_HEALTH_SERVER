const { saveConversation, getConversationsByUserId, countConversationsByUserId } = require('../../models/user/conversationModel');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });

exports.sendMessageToChatbot = async (req, res) => {
    const userId = req.user.id;
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    try {
        const result = await model.generateContent(message);
        const bot_reply = result.response.text();

        await saveConversation(userId, message, bot_reply);

        res.json({
            code: 200,
            message: "success",
            sendMessage: {
                user_message: message,
                bot_reply,
            }
        });
    } catch (error) {
        console.error("Error with chatbot integration:", error);
        res.status(500).json({ error: "Failed to process the message" });
    }
};

exports.getConversationHistory = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    try {
        const conversations = await getConversationsByUserId(userId, parseInt(limit), offset);

        const total = await countConversationsByUserId(userId);

        res.json({
            msg: 'success',
            code: 200,
            data: {
                conversations: {
                    data: conversations,
                    total,
                    per_page: parseInt(limit),
                    current_page: parseInt(page),
                    last_page: Math.ceil(total / limit),
                    has_more_pages: page < Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ msg: 'error', code: 500, error: 'Internal server error' });
    }
};
