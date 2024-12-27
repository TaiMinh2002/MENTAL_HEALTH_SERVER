const db = require('../../config/db');

const MoodEntry = {
    getAllMoodEntries: (limit, offset, callback) => {
        const query = `
            SELECT me.id, me.user_id, u.username, me.note, me.date
            FROM mood_entries me
            JOIN users u ON me.user_id = u.id
            WHERE me.deleted_at IS NULL
            LIMIT ? OFFSET ?
        `;
        db.query(query, [parseInt(limit), parseInt(offset)], callback);
    },
    countAllMoodEntries: (callback) => {
        const query = `
            SELECT COUNT(*) AS total
            FROM mood_entries
            WHERE deleted_at IS NULL
        `;
        db.query(query, callback);
    },
    getMoodEntryById: (id, callback) => {
        const query = `
            SELECT me.id, me.user_id, u.username, me.note, me.date
            FROM mood_entries me
            JOIN users u ON me.user_id = u.id
            WHERE me.id = ? AND me.deleted_at IS NULL
        `;
        db.query(query, [id], callback);
    },
    createMoodEntry: (moodEntryData, callback) => {
        const query = 'INSERT INTO mood_entries (user_id, note, date) VALUES (?, ?, ?)';
        const values = [moodEntryData.user_id, moodEntryData.note, moodEntryData.date];
        db.query(query, values, (err, results) => {
            if (err) {
                return callback(err);
            }

            if (results.affectedRows === 0) {
                return callback(new Error('Failed to insert mood entry'));
            }

            const newEntryId = results.insertId;
            MoodEntry.getMoodEntryById(newEntryId, (err, rows) => {
                if (err) {
                    return callback(err);
                }
                if (!rows || rows.length === 0) {
                    return callback(new Error('Mood entry not found after insert'));
                }
                callback(null, rows[0]); // Trả về một record duy nhất
            });
        });
    },
    updateMoodEntry: (id, moodEntryData, callback) => {
        const query = 'UPDATE mood_entries SET ? WHERE id = ?';
        db.query(query, [moodEntryData, id], (err, results) => {
            if (err) {
                return callback(err);
            }
            MoodEntry.getMoodEntryById(id, callback);
        });
    },
    deleteMoodEntry: (id, callback) => {
        const deletedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const query = 'UPDATE mood_entries SET deleted_at = ? WHERE id = ?';
        db.query(query, [deletedAt, id], callback);
    }
};

module.exports = MoodEntry;
