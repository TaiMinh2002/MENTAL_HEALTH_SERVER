const db = require('../../config/db');

const saveConversation = async (userId, userMessage, botReply) => {
    return await db('conversations').insert({
        user_id: userId,
        user_message: userMessage,
        bot_reply: botReply,
    });
};

const getConversationsByUserId = async (userId, limit, offset) => {
    return await db('conversations')
        .where({ user_id: userId })
        .orderBy('created_at', 'asc')
        .limit(limit)
        .offset(offset)
        .select('*');
};

const countConversationsByUserId = async (userId) => {
    const result = await db('conversations')
        .where({ user_id: userId })
        .count('* as count');
    return parseInt(result[0].count, 10);
};

module.exports = {
    saveConversation,
    getConversationsByUserId,
    countConversationsByUserId,
};
