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

exports.getAllPosts = (req, res) => {
    Post.getAllPosts((err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        res.json(results);
    });
};

exports.getPostById = (req, res) => {
    const { id } = req.params;
    Post.getPostById(id, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json(results[0]);
    });
};

exports.createPost = async (req, res) => {
    const { forum_id, title, content } = req.query;
    const user_id = req.user.id;
    const postData = { forum_id, user_id, title, content };

    Post.createPost(postData, (err, insertResults) => {
        if (err) {
            return res.status(500).json({ error: err });
        }

        Forum.incrementPostCount(forum_id, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error updating post count' });
            }
            res.json({
                message: 'Post created successfully',
                post_id: insertResults.insertId,
                forum_id: +forum_id
            });
        });
    });
};

exports.updatePost = async (req, res) => {
    const { id } = req.params;
    const { forum_id, title, content } = req.body;
    const user_id = req.user.id;

    const postData = { forum_id, user_id, title, content };

    Post.getPostById(id, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const post = results[0];
        if (post.user_id !== user_id) {
            return res.status(403).json({ error: 'You do not have permission to update this post' });
        }

        Post.updatePost(id, postData, (err) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            res.json({ message: 'Post updated successfully' });
        });
    });
};

exports.deletePost = (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    Post.getPostById(id, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const post = results[0];
        if (post.user_id !== user_id) {
            return res.status(403).json({ error: 'You do not have permission to delete this post' });
        }

        Post.deletePost(id, (err) => {
            if (err) {
                return res.status(500).json({ error: err });
            }

            Forum.decrementPostCount(post.forum_id, (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Error updating post count' });
                }
                res.json({ message: 'Post marked as deleted' });
            });
        });
    });
};
