const Post = require('../models/postModel');

// Lấy tất cả các bài đăng
exports.getAllPosts = (req, res) => {
    Post.getAllPosts((err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        res.json(results);
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
        res.json(results[0]);
    });
};

// Tạo mới hoặc cập nhật thông tin bài đăng (upsert)
exports.upsertPost = (req, res) => {
    const { id } = req.params;
    const { forum_id, user_id, content } = req.body;
    const postData = { forum_id, user_id, content };

    if (id) {
        Post.getPostById(id, (err, results) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            if (results.length === 0) {
                return res.status(404).json({ error: 'Post not found' });
            }
            Post.updatePost(id, postData, (err, updateResults) => {
                if (err) {
                    return res.status(500).json({ error: err });
                }
                res.json({ message: 'Post updated successfully' });
            });
        });
    } else {
        Post.createPost(postData, (err, insertResults) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            res.json({ id: insertResults.insertId });
        });
    }
};

// Xóa bài đăng theo ID
exports.deletePost = (req, res) => {
    const { id } = req.params;
    Post.deletePost(id, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        res.json({ message: 'Post marked as deleted' });
    });
};
