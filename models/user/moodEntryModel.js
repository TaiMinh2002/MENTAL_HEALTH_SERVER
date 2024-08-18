const db = require('../../config/db');

const MoodEntry = {
    getAllMoodEntries: (callback) => {
        db.query('SELECT * FROM mood_entries WHERE deleted_at IS NULL', callback);
    },
    getMoodEntryById: (id, callback) => {
        db.query('SELECT * FROM mood_entries WHERE id = ? AND deleted_at IS NULL', [id], callback);
    },
    createMoodEntry: (moodEntryData, callback) => {
        db.query('INSERT INTO mood_entries SET ?', moodEntryData, callback);
    },
    updateMoodEntry: (id, moodEntryData, callback) => {
        db.query('UPDATE mood_entries SET ? WHERE id = ?', [moodEntryData, id], callback);
    },
    deleteMoodEntry: (id, callback) => {
        const deletedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
        db.query('UPDATE mood_entries SET deleted_at = ? WHERE id = ?', [deletedAt, id], callback);
    }
};

module.exports = MoodEntry;
