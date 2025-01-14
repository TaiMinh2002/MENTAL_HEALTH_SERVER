const db = require('../../config/db');

const Post = {
    getAllPosts: async (limit, offset) => {
        return await db('posts')
            .join('users', 'posts.user_id', 'users.id')
            .whereNull('posts.deleted_at')
            .select('posts.*', 'users.username as username')
            .limit(limit)
            .offset(offset);
    },

    countAllPosts: async () => {
        const result = await db('posts')
            .whereNull('deleted_at')
            .count('* as total');
        return parseInt(result[0].total, 10);
    },    

    getPostById: async (id) => {
        return await db('posts')
            .join('users', 'posts.user_id', 'users.id')
            .where('posts.id', id)
            .whereNull('posts.deleted_at')
            .select('posts.*', 'users.username as username')
            .first();
    },

    createPost: async (postData) => {
        const [id] = await db('posts').insert(postData);
        return id;
    },

    updatePost: async (id, postData) => {
        await db('posts')
            .where({ id })
            .whereNull('deleted_at')
            .update(postData);
        return await Post.getPostById(id);
    },

    deletePost: async (id) => {
        const deletedAt = new Date();
        return await db('posts')
            .where({ id })
            .update({ deleted_at: deletedAt });
    },
};

module.exports = Post;
