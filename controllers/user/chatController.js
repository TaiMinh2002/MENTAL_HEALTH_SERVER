const axios = require('axios');
const chatModel = require('../../models/user/chatModel');

// Gửi tin nhắn tới GPT API và lưu phản hồi vào DB
const sendMessage = async (req, res) => {
    const userId = req.user.id;  // Lấy user_id từ token đã được giải mã qua middleware auth
    const userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        // Gọi OpenAI GPT API để lấy phản hồi từ chatbot
        const response = await axios.post('https://api.openai.com/v1/completions', {
            model: 'text-davinci-003',
            prompt: userMessage,
            max_tokens: 150,
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,  // Lấy API key từ file .env
                'Content-Type': 'application/json'
            }
        });

        const botReply = response.data.choices[0].text.trim();

        // Lưu cuộc hội thoại vào cơ sở dữ liệu
        chatModel.saveConversation(userId, userMessage, botReply, (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({ reply: botReply });
        });

    } catch (error) {
        console.error('Error with GPT API:', error);
        res.status(500).json({ error: 'Failed to communicate with the chatbot.' });
    }
};

// Lấy lịch sử cuộc hội thoại của người dùng
const getConversations = (req, res) => {
    const userId = req.user.id;  // Lấy user_id từ token đã được giải mã qua middleware auth

    chatModel.getConversations(userId, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
};

module.exports = {
    sendMessage,
    getConversations
};
