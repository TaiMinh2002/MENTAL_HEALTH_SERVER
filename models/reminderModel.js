const db = require('../config/db');

const Reminder = {
    getAllReminders: (callback) => {
        db.query('SELECT * FROM reminders WHERE deleted_at IS NULL', callback);
    },
    getReminderById: (id, callback) => {
        db.query('SELECT * FROM reminders WHERE id = ? AND deleted_at IS NULL', [id], callback);
    },
    createReminder: (reminderData, callback) => {
        db.query('INSERT INTO reminders SET ?', reminderData, callback);
    },
    updateReminder: (id, reminderData, callback) => {
        db.query('UPDATE reminders SET ? WHERE id = ?', [reminderData, id], callback);
    },
    deleteReminder: (id, callback) => {
        const deletedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
        db.query('UPDATE reminders SET deleted_at = ? WHERE id = ?', [deletedAt, id], callback);
    }
};

module.exports = Reminder;
