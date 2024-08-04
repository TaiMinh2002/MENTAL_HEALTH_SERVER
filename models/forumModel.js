const db = require('../config/db');

const Forum = {
    getAllForums: (page, limit, keyword, callback) => {
        const offset = (page - 1) * limit;
        const query = `SELECT * FROM forums WHERE deleted_at IS NULL AND title LIKE ? LIMIT ? OFFSET ?`;
        const values = [`%${keyword}%`, parseInt(limit), offset];
        db.query(query, values, callback);
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
        const deleted_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
        db.query('UPDATE forums SET deleted_at = ? WHERE id = ?', [deleted_at, id], callback);
    },

    joinForum: (joinData, callback) => {
        db.query('INSERT INTO forum_members SET ?', joinData, (err, results) => {
            if (err) {
                console.error('SQL Error:', err);
            }
            callback(err, results);
        });
    },

    outForum: (forum_id, user_id, callback) => {
        const out_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
        db.query('UPDATE forum_members SET out_at = ? WHERE forum_id = ? AND user_id = ? AND out_at IS NULL', [out_at, forum_id, user_id], (err, results) => {
            if (err) {
                console.error('SQL Error:', err);
            }
            callback(err, results);
        });
    },

    incrementMemberCount: (forum_id, callback) => {
        db.query('UPDATE forums SET member_count = member_count + 1 WHERE id = ?', [forum_id], (err, results) => {
            if (err) {
                console.error('SQL Error:', err);
            }
            callback(err, results);
        });
    },

    decrementMemberCount: (forum_id, callback) => {
        db.query('UPDATE forums SET member_count = member_count - 1 WHERE id = ?', [forum_id], (err, results) => {
            if (err) {
                console.error('SQL Error:', err);
            }
            callback(err, results);
        });
    },

    countAllForums: (keyword, callback) => {
        const query = `SELECT COUNT(*) AS total FROM forums WHERE deleted_at IS NULL AND title LIKE ?`;
        const value = `%${keyword}%`;
        db.query(query, [value], callback);
    },

    incrementPostCount: (forum_id, callback) => {
        db.query('UPDATE forums SET post_count = post_count + 1 WHERE id = ?', [forum_id], (err, results) => {
            if (err) {
                console.error('SQL Error:', err);
            }
            callback(err, results);
        });
    },

    decrementPostCount: (forum_id, callback) => {
        db.query('UPDATE forums SET post_count = post_count - 1 WHERE id = ?', [forum_id], (err, results) => {
            if (err) {
                console.error('SQL Error:', err);
            }
            callback(err, results);
        });
    }
};

module.exports = Forum;
