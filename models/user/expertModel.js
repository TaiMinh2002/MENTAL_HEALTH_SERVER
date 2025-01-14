const db = require('../../config/db');

const Expert = {
    getAllExperts: async (page, limit, keyword, specialization) => {
        const offset = (page - 1) * limit;
        return await db('experts')
            .whereNull('deleted_at')
            .andWhere('name', 'like', `%${keyword}%`)
            .andWhere('specialization', specialization)
            .limit(limit)
            .offset(offset)
            .select('*');
    },    

    getExpertById: async (id) => {
        return await db('experts as e')
            .leftJoin('users as u', 'u.expert_id', 'e.id')
            .where('e.id', id)
            .whereNull('e.deleted_at')
            .select('e.*', 'u.id as user_id')
            .first();
    },

    countAllExperts: async (keyword, specialization) => {
        const result = await db('experts')
            .whereNull('deleted_at')
            .andWhere('name', 'like', `%${keyword}%`)
            .andWhere('specialization', specialization)
            .count('* as total');
    
        return parseInt(result[0].total, 10);
    },
};

module.exports = Expert;
