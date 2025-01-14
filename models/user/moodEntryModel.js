const db = require('../../config/db');

const MoodEntry = {
    getAllMoodEntries: async (limit, offset) => {
        return await db('mood_entries as me')
            .join('users as u', 'me.user_id', 'u.id')
            .whereNull('me.deleted_at')
            .select('me.id', 'me.user_id', 'u.username', 'me.note', 'me.date')
            .limit(limit)
            .offset(offset);
    },

    countAllMoodEntries: async () => {
        const result = await db('mood_entries')
            .whereNull('deleted_at')
            .count('* as total');
        return parseInt(result[0].total, 10);
    },    

    getMoodEntryById: async (id) => {
        return await db('mood_entries as me')
            .join('users as u', 'me.user_id', 'u.id')
            .where('me.id', id)
            .whereNull('me.deleted_at')
            .select('me.id', 'me.user_id', 'u.username', 'me.note', 'me.date')
            .first();
    },

    createMoodEntry: async (moodEntryData) => {
        const [id] = await db('mood_entries').insert(moodEntryData);
        return await MoodEntry.getMoodEntryById(id);
    },

    updateMoodEntry: async (id, moodEntryData) => {
        await db('mood_entries')
            .where({ id })
            .whereNull('deleted_at')
            .update(moodEntryData);
        return await MoodEntry.getMoodEntryById(id);
    },

    deleteMoodEntry: async (id) => {
        const deletedAt = new Date();
        return await db('mood_entries')
            .where({ id })
            .update({ deleted_at: deletedAt });
    },
};

module.exports = MoodEntry;
