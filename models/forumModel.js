const db = require('../config/db');

const Forum = {
    getAllForums: (callback) => {
        db.query('SELECT * FROM forums WHERE deleted_at IS NULL', callback);
    },
    getForumById: (id, callback) => {
        db.query('SELECT * FROM forums WHERE id = ? AND deleted_at IS NULL', [id], callback);
    },
    createForum: (forumData, callback) => {
        db.query('INSERT INTO forums SET ?', forumData, callback);
    },
    updateForum: (id, forumData, callback) => {
        db.query('UPDATE forums SET ? WHERE id = ?', [forumData, id], callback);
    },
    deleteForum: (id, callback) => {
        const deletedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
        db.query('UPDATE forums SET deleted_at = ? WHERE id = ?', [deletedAt, id], callback);
    }
};

module.exports = Forum;
