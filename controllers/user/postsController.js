const Post = require('../../models/user/postModel');
const Forum = require('../../models/user/forumModel');
const { UploadClient } = require('@uploadcare/upload-client');
require('dotenv').config();

const uploadToUploadcare = async (file) => {
    try {
        const client = new UploadClient({ publicKey: process.env.UPLOADCARE_PUBLIC_KEY });
        const response = await client.uploadFile(file.buffer, {
            fileName: file.originalname,
            contentType: file.mimetype,
        });
        return response.cdnUrl;
    } catch (error) {
        console.error('Error uploading to Uploadcare:', error.message);
        throw new Error('Error uploading file to Uploadcare');
    }
};

exports.getAllPosts = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    const offset = (parsedPage - 1) * parsedLimit;

    try {
        const posts = await Post.getAllPosts(parsedLimit, offset);

        const total = await Post.countAllPosts();

        const lastPage = Math.ceil(total / parsedLimit);
        const hasMorePages = parsedPage < lastPage;

        res.json({
            msg: "success",
            code: 200,
            data: {
                posts: {
                    data: posts,
                    total,
                    per_page: parsedLimit,
                    current_page: parsedPage,
                    last_page: lastPage,
                    has_more_pages: hasMorePages,
                },
            },
        });
    } catch (err) {
        console.error('Error fetching posts:', err);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
};

exports.getPostById = async (req, res) => {
    const { id } = req.params;

    try {
        const post = await Post.getPostById(id);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.json({
            msg: "success",
            code: 200,
            data: post,
        });
    } catch (err) {
        console.error('Error fetching post:', err);
        res.status(500).json({ error: 'Failed to fetch post' });
    }
};

exports.createPost = async (req, res) => {
    const { forum_id, title, content } = req.query;
    const user_id = req.user.id;

    try {
        const postData = { forum_id, user_id, title, content };
        const postId = await Post.createPost(postData);

        await Forum.incrementPostCount(forum_id);

        res.json({
            msg: "success",
            code: 200,
            data: { post_id: postId, forum_id: +forum_id },
        });
    } catch (err) {
        console.error('Error creating post:', err);
        res.status(500).json({ error: 'Failed to create post' });
    }
};

exports.updatePost = async (req, res) => {
    const { id } = req.params;
    const { forum_id, title, content } = req.body;
    const user_id = req.user.id;

    try {
        const post = await Post.getPostById(id);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.user_id !== user_id) {
            return res.status(403).json({ error: 'You do not have permission to update this post' });
        }

        const postData = { forum_id, user_id, title, content };
        const updatedPost = await Post.updatePost(id, postData);

        res.json({
            msg: "success",
            code: 200,
            data: updatedPost,
        });
    } catch (err) {
        console.error('Error updating post:', err);
        res.status(500).json({ error: 'Failed to update post' });
    }
};

exports.deletePost = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    try {
        const post = await Post.getPostById(id);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.user_id !== user_id) {
            return res.status(403).json({ error: 'You do not have permission to delete this post' });
        }

        await Post.deletePost(id);
        await Forum.decrementPostCount(post.forum_id);

        res.json({
            msg: "success",
            code: 200,
            message: "Post marked as deleted",
        });
    } catch (err) {
        console.error('Error deleting post:', err);
        res.status(500).json({ error: 'Failed to delete post' });
    }
};
