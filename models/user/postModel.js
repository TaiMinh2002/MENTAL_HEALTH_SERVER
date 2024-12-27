const db = require('../../config/db');

const Post = {
    getAllPosts: (callback) => {
        const query = `
        SELECT 
            posts.*,
            users.username AS username
        FROM posts
        JOIN users ON posts.user_id = users.id
        WHERE posts.deleted_at IS NULL
    `;
        db.query(query, callback);
    },

    getPostById: (id, callback) => {
        const query = `
        SELECT 
            posts.*,
            users.username AS username
        FROM posts
        JOIN users ON posts.user_id = users.id
        WHERE posts.id = ? AND posts.deleted_at IS NULL
    `;
        db.query(query, [id], callback);
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
