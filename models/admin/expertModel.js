const db = require('../../config/db');

const Expert = {
    getAllExperts: async (page, limit, keyword) => {
        const offset = (page - 1) * limit;
        return await db('experts')
            .whereNull('deleted_at')
            .andWhere('name', 'like', `%${keyword}%`)
            .limit(limit)
            .offset(offset)
            .select('*');
    },

    getExpertById: async (id) => {
        return await db('experts')
            .where({ id })
            .whereNull('deleted_at')
            .first();
    },

    createExpert: async (expertData) => {
        const [id] = await db('experts').insert(expertData);
        return id;
    },

    updateExpert: async (id, expertData) => {
        return await db('experts')
            .where({ id })
            .whereNull('deleted_at')
            .update(expertData);
    },

    deleteExpert: async (id) => {
        const deletedAt = new Date();
        return await db('experts')
            .where({ id })
            .update({ deleted_at: deletedAt });
    },

    checkIfExpertExists: async (id) => {
        return await db('experts')
            .where({ id })
            .whereNull('deleted_at')
            .first();
    },

    checkPhoneNumberExists: async (phone_number) => {
        return await db('experts')
            .where({ phone_number })
            .whereNull('deleted_at')
            .first();
    },

    countAllExperts: async (keyword) => {
        const result = await db('experts')
            .whereNull('deleted_at')
            .andWhere('name', 'like', `%${keyword}%`)
            .count('* as total');
        return result[0].total;
    },
};

module.exports = Expert;
