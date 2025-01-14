const db = require("../../config/db");

const UserExpertMessage = {
  create: async (chat_id, sender_id, receiver_id, message) => {
    const [id] = await db('user_expert_messages').insert({
      chat_id,
      sender_id,
      receiver_id,
      message,
    });
    return id;
  },

  getMessagesByChatId: async (chatId, limit, offset) => {
    return await db('user_expert_messages as m')
        .leftJoin('users as u', 'm.sender_id', 'u.id')
        .leftJoin('users as r', 'm.receiver_id', 'r.id')
        .where('m.chat_id', chatId)
        .select(
            'm.*',
            'u.username as sender',
            'r.username as receiver'
        )
        .orderBy('m.created_at', 'asc')
        .limit(limit)
        .offset(offset);
  },

  countMessagesByChatId: async (chatId) => {
    const result = await db('user_expert_messages')
        .where('chat_id', chatId)
        .count('* as total');
    return parseInt(result[0].total, 10);
  },
};

module.exports = UserExpertMessage;
