const MoodEntry = require('../models/moodEntryModel');

// Lấy tất cả các mục nhật ký tâm trạng
exports.getAllMoodEntries = (req, res) => {
    MoodEntry.getAllMoodEntries((err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        res.json(results);
    });
};

// Lấy chi tiết một mục nhật ký tâm trạng theo ID
exports.getMoodEntryById = (req, res) => {
    const { id } = req.params;
    MoodEntry.getMoodEntryById(id, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Mood entry not found' });
        }
        res.json(results[0]);
    });
};

// Tạo mới hoặc cập nhật thông tin nhật ký tâm trạng (upsert)
exports.upsertMoodEntry = (req, res) => {
    const { id } = req.params;
    const { user_id, mood, note, date } = req.body;
    const moodEntryData = { user_id, mood, note, date };

    if (id) {
        MoodEntry.getMoodEntryById(id, (err, results) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            if (results.length === 0) {
                return res.status(404).json({ error: 'Mood entry not found' });
            }
            MoodEntry.updateMoodEntry(id, moodEntryData, (err, updateResults) => {
                if (err) {
                    return res.status(500).json({ error: err });
                }
                res.json({ message: 'Mood entry updated successfully' });
            });
        });
    } else {
        MoodEntry.createMoodEntry(moodEntryData, (err, insertResults) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            res.json({ id: insertResults.insertId });
        });
    }
};

// Xóa nhật ký tâm trạng theo ID
exports.deleteMoodEntry = (req, res) => {
    const { id } = req.params;
    MoodEntry.deleteMoodEntry(id, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        res.json({ message: 'Mood entry marked as deleted' });
    });
};
