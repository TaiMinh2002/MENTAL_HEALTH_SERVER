const db = require('../config/db');

const Post = {
    getAllPosts: (callback) => {
        db.query('SELECT * FROM posts WHERE deleted_at IS NULL', callback);
    },

    getPostById: (id, callback) => {
        db.query('SELECT * FROM posts WHERE id = ? AND deleted_at IS NULL', [id], callback);
    },

    createPost: (postData, callback) => {
        db.query('INSERT INTO posts SET ?', postData, callback);
    },

    updatePost: (id, postData, callback) => {
        db.query('UPDATE posts SET ? WHERE id = ?', [postData, id], callback);
    },

    deletePost: (id, callback) => {
        const deletedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
        db.query('UPDATE posts SET deleted_at = ? WHERE id = ?', [deletedAt, id], callback);
    }
};

module.exports = Post;
