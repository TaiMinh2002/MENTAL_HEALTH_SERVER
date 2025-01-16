const db = require("../../config/db");

const UserExpertChat = {
    findOrCreate: async (user_id, expert_id) => {
        const expert = await db('users').where({ expert_id }).first();
        if (!expert) throw new Error("Expert not found");

        const resolvedExpertId = expert.id;

        const existingChat = await db('user_expert_chats')
            .where({ user_id, expert_id: resolvedExpertId })
            .first();

        if (existingChat) {
            return existingChat;
        }

        const [chatId] = await db('user_expert_chats').insert({
            user_id,
            expert_id: resolvedExpertId,
        });
        return { id: chatId, user_id, expert_id: resolvedExpertId };
    },

    getChatsByUserId: async (user_id, limit, offset) => {
        return await db('user_expert_chats as c')
            .leftJoin('users as u1', 'c.user_id', 'u1.id')
            .leftJoin('users as u2', 'c.expert_id', 'u2.id')
            .leftJoin('experts as e', 'u2.expert_id', 'e.id')
            .where('c.user_id', user_id)
            .orWhere('c.expert_id', user_id)
            .select(
                'c.id as chat_id',
                'c.user_id',
                'c.expert_id',
                'u1.username as user_name',
                'u1.avatar as user_avatar',
                'e.name as expert_name',
                'e.avatar as expert_avatar',
                'c.created_at',
                db.raw(`
                (SELECT m.message 
                 FROM user_expert_messages m 
                 WHERE m.chat_id = c.id 
                 ORDER BY m.created_at DESC 
                 LIMIT 1) AS latest_message
            `),
                db.raw(`
                (SELECT m.created_at 
                 FROM user_expert_messages m 
                 WHERE m.chat_id = c.id 
                 ORDER BY m.created_at DESC 
                 LIMIT 1) AS last_time
            `)
            )
            .orderBy('last_time', 'desc')
            .limit(limit)
            .offset(offset);
    },

    countChatsByUserId: async (user_id) => {
        const result = await db('user_expert_chats')
            .where('user_id', user_id)
            .orWhere('expert_id', user_id)
            .count('* as total');
        return parseInt(result[0].total, 10);
    },
};

module.exports = UserExpertChat;
