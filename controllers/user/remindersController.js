const Reminder = require('../../models/user/reminderModel');

// Lấy tất cả các nhắc nhở
exports.getAllReminders = (req, res) => {
    Reminder.getAllReminders((err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        res.json(results);
    });
};

// Lấy chi tiết nhắc nhở theo ID
exports.getReminderById = (req, res) => {
    const { id } = req.params;
    Reminder.getReminderById(id, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Reminder not found' });
        }
        res.json(results[0]);
    });
};

// Tạo mới hoặc cập nhật thông tin nhắc nhở (upsert)
exports.upsertReminder = (req, res) => {
    const { id } = req.params;
    const { user_id, reminder_text, reminder_time } = req.body;
    const reminderData = { user_id, reminder_text, reminder_time };

    if (id) {
        Reminder.getReminderById(id, (err, results) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            if (results.length === 0) {
                return res.status(404).json({ error: 'Reminder not found' });
            }
            Reminder.updateReminder(id, reminderData, (err, updateResults) => {
                if (err) {
                    return res.status(500).json({ error: err });
                }
                res.json({ message: 'Reminder updated successfully' });
            });
        });
    } else {
        Reminder.createReminder(reminderData, (err, insertResults) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            res.json({ id: insertResults.insertId });
        });
    }
};

// Xóa nhắc nhở theo ID
exports.deleteReminder = (req, res) => {
    const { id } = req.params;
    Reminder.deleteReminder(id, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        res.json({ message: 'Reminder marked as deleted' });
    });
};
