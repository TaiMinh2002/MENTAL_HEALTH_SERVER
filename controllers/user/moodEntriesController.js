const MoodEntry = require('../../models/user/moodEntryModel');

exports.getAllMoodEntries = (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page > 0 ? page - 1 : 0) * limit;

    MoodEntry.getAllMoodEntries(limit, offset, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch mood entries' });
        }

        MoodEntry.countAllMoodEntries((err, countResults) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to count mood entries' });
            }

            const total = countResults[0].total;
            const lastPage = Math.ceil(total / limit);

            res.json({
                msg: "success",
                code: 200,
                data: {
                    mood_entries: {
                        data: results,
                        total,
                        per_page: limit,
                        current_page: parseInt(page),
                        last_page: lastPage,
                        has_more_pages: parseInt(page) < lastPage,
                    },
                },
            });
        });
    });
};

exports.getMoodEntryById = (req, res) => {
    const { id } = req.params;

    MoodEntry.getMoodEntryById(id, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch mood entry' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Mood entry not found' });
        }

        const moodEntry = results[0];

        res.json({
            msg: "success",
            code: 200,
            data: {
                mood_entry: moodEntry
            }
        });
    });
};

exports.createMoodEntry = (req, res) => {
    try {
        const { note } = req.body;
        const user_id = req.user?.id;
        const date = new Date().toISOString().slice(0, 10);
        if (!user_id) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const moodEntryData = { user_id, note, date };

        MoodEntry.createMoodEntry(moodEntryData, (err, result) => {
            if (err) {
                console.error('Database Error:', err);
                return res.status(500).json({ error: 'Failed to create mood entry' });
            }

            if (!result) {
                return res.status(500).json({ error: 'No result returned from database' });
            }

            const response = {
                note: result.note || moodEntryData.note,
                date: result.date || moodEntryData.date
            };
            res.json(response);
        });
    } catch (error) {
        console.error('Unexpected Error:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    }
};

exports.updateMoodEntry = (req, res) => {
    const { id } = req.params;
    const { mood, note } = req.body;
    const user_id = req.user.id;
    const date = new Date().toISOString().slice(0, 10);

    const moodEntryData = { user_id, mood, note, date };
    MoodEntry.updateMoodEntry(id, moodEntryData, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to update mood entry' });
        }
        res.json(result);
    });
};

exports.deleteMoodEntry = (req, res) => {
    const { id } = req.params;
    MoodEntry.deleteMoodEntry(id, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to delete mood entry' });
        }
        res.json({ message: 'Mood entry marked as deleted' });
    });
};
