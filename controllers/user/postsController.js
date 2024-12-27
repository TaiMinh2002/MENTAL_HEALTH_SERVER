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

// Lấy tất cả các bài đăng
exports.getAllPosts = (req, res) => {
    Post.getAllPosts((err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        res.json(results); // Kết quả sẽ bao gồm cả `username`
    });
};

// Lấy chi tiết bài đăng theo ID
exports.getPostById = (req, res) => {
    const { id } = req.params;
    Post.getPostById(id, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json(results[0]); // Kết quả sẽ bao gồm cả `username`
    });
};

// Tạo bài đăng mới
exports.createPost = async (req, res) => {
    const { forum_id, title, content } = req.query;
    const user_id = req.user.id; // Assuming req.user contains the logged-in user's info

    const postData = { forum_id, user_id, title, content };

    // Tạo bài đăng
    Post.createPost(postData, (err, insertResults) => {
        if (err) {
            return res.status(500).json({ error: err });
        }

        // Tăng số lượng bài viết trong diễn đàn
        Forum.incrementPostCount(forum_id, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error updating post count' });
            }
            res.json({
                message: 'Post created successfully',
                post_id: insertResults.insertId, // Trả thêm post_id
                forum_id: +forum_id // Ép kiểu forum_id thành số nguyên
            });
        });
    });
};

// Cập nhật bài đăng
exports.updatePost = async (req, res) => {
    const { id } = req.params;
    const { forum_id, title, content } = req.body;
    const user_id = req.user.id; // Assuming req.user contains the logged-in user's info

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

// Xóa bài đăng theo ID
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
