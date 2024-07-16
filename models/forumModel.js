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
    },
    joinForum: (forum_id, user_id, callback) => {
        const joinData = { forum_id, user_id, joined_at: new Date() };
        db.query('INSERT INTO forum_members SET ?', joinData, (err, results) => {
            if (err) {
                return callback(err);
            }
            db.query('UPDATE forums SET member_count = member_count + 1 WHERE id = ?', [forum_id], callback);
        });
    },
    createPost: (postData, callback) => {
        db.query('INSERT INTO posts SET ?', postData, (err, results) => {
            if (err) {
                return callback(err);
            }
            db.query('UPDATE forums SET post_count = post_count + 1 WHERE id = ?', [postData.forum_id], callback);
        });
    },
    isMember: (forum_id, user_id, callback) => {
        db.query('SELECT * FROM forum_members WHERE forum_id = ? AND user_id = ? AND deleted_at IS NULL', [forum_id, user_id], (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results.length > 0);
        });
    },
};

module.exports = Forum;
