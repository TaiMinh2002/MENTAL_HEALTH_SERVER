const { saveConversation, getConversationsByUserId } = require('../../models/user/conversationModel');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });

exports.sendMessageToChatbot = async (req, res) => {
    const userId = req.user.id;
    const { message } = req.body;

    try {
        const result = await model.generateContent(message);
        const botReply = result.response.text();

        saveConversation(userId, message, botReply, (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Internal server error" });
            }
            res.json({
                message: "Message processed successfully",
                userMessage: message,
                botReply
            });
        });
    } catch (error) {
        console.error("Error with chatbot integration:", error);
        res.status(500).json({ error: "Failed to process the message" });
    }
};

exports.getConversationHistory = (req, res) => {
    const userId = req.user.id;

    getConversationsByUserId(userId, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
        res.json({
            message: "Conversation history retrieved successfully",
            data: results
        });
    });
};