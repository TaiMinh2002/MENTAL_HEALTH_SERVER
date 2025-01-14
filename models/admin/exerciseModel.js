const db = require('../../config/db');

const Exercise = {
    getAllExercises: async (page, limit, keyword, type) => {
        const offset = (page - 1) * limit;

        let query = db('exercises')
            .whereNull('deleted_at')
            .andWhere('title', 'like', `%${keyword}%`);

        if (type) {
            query = query.andWhere('type', type);
        }

        return await query
            .limit(limit)
            .offset(offset)
            .select('*');
    },

    getExerciseById: async (id) => {
        return await db('exercises')
            .where({ id })
            .whereNull('deleted_at')
            .first();
    },

    countAllExercises: async (keyword, type) => {
        let query = db('exercises')
            .whereNull('deleted_at')
            .andWhere('title', 'like', `%${keyword}%`);

        if (type) {
            query = query.andWhere('type', type);
        }

        const result = await query.count('* as total');
        return result[0].total;
    },

    createExercise: async (exerciseData) => {
        const [id] = await db('exercises').insert(exerciseData);
        return id;
    },

    updateExercise: async (id, exerciseData) => {
        return await db('exercises')
            .where({ id })
            .whereNull('deleted_at')
            .update(exerciseData);
    },

    deleteExercise: async (id) => {
        const deletedAt = new Date();
        return await db('exercises')
            .where({ id })
            .update({ deleted_at: deletedAt });
    },

    checkExerciseTitleExists: async (title) => {
        return await db('exercises')
            .where({ title })
            .first();
    },

    checkIfExerciseExists: async (id) => {
        return await db('exercises')
            .where({ id })
            .whereNull('deleted_at')
            .first();
    },
};

module.exports = Exercise;
