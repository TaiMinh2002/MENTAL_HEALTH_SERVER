const MoodEntry = require('../../models/user/moodEntryModel');

exports.getAllMoodEntries = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    const offset = (parsedPage - 1) * parsedLimit;

    try {
        const moodEntries = await MoodEntry.getAllMoodEntries(parsedLimit, offset);

        const total = await MoodEntry.countAllMoodEntries();

        const lastPage = Math.ceil(total / parsedLimit);
        const hasMorePages = parsedPage < lastPage;

        res.json({
            msg: "success",
            code: 200,
            data: {
                mood_entries: {
                    data: moodEntries,
                    total,
                    per_page: parsedLimit,
                    current_page: parsedPage,
                    last_page: lastPage,
                    has_more_pages: hasMorePages,
                },
            },
        });
    } catch (err) {
        console.error('Error fetching mood entries:', err);
        res.status(500).json({ error: 'Failed to fetch mood entries' });
    }
};

exports.getMoodEntryById = async (req, res) => {
    const { id } = req.params;

    try {
        const moodEntry = await MoodEntry.getMoodEntryById(id);

        if (!moodEntry) {
            return res.status(404).json({ error: 'Mood entry not found' });
        }

        res.json({
            msg: "success",
            code: 200,
            data: { mood_entry: moodEntry },
        });
    } catch (err) {
        console.error('Error fetching mood entry:', err);
        res.status(500).json({ error: 'Failed to fetch mood entry' });
    }
};

exports.createMoodEntry = async (req, res) => {
    const { note } = req.query;
    const user_id = req.user?.id;
    const date = new Date().toISOString().slice(0, 10);

    if (!user_id) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        const moodEntryData = { user_id, note, date };
        const newMoodEntry = await MoodEntry.createMoodEntry(moodEntryData);

        res.json({
            msg: "success",
            code: 200,
            data: { mood_entry: newMoodEntry },
        });
    } catch (err) {
        console.error('Error creating mood entry:', err);
        res.status(500).json({ error: 'Failed to create mood entry' });
    }
};

exports.updateMoodEntry = async (req, res) => {
    const { id } = req.params;
    const { mood, note } = req.body;
    const user_id = req.user.id;
    const date = new Date().toISOString().slice(0, 10);

    try {
        const moodEntryData = { user_id, mood, note, date };
        const updatedMoodEntry = await MoodEntry.updateMoodEntry(id, moodEntryData);

        res.json({
            msg: "success",
            code: 200,
            data: { mood_entry: updatedMoodEntry },
        });
    } catch (err) {
        console.error('Error updating mood entry:', err);
        res.status(500).json({ error: 'Failed to update mood entry' });
    }
};

exports.deleteMoodEntry = async (req, res) => {
    const { id } = req.params;

    try {
        await MoodEntry.deleteMoodEntry(id);
        res.json({ msg: "success", code: 200, message: "Mood entry marked as deleted" });
    } catch (err) {
        console.error('Error deleting mood entry:', err);
        res.status(500).json({ error: 'Failed to delete mood entry' });
    }
};
