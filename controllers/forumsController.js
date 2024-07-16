const Forum = require('../models/forumModel');

// Lấy tất cả các diễn đàn
exports.getAllForums = (req, res) => {
    Forum.getAllForums((err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        res.json(results);
    });
};

// Lấy chi tiết diễn đàn theo ID
exports.getForumById = (req, res) => {
    const { id } = req.params;
    Forum.getForumById(id, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Forum not found' });
        }
        res.json(results[0]);
    });
};

// Tạo mới hoặc cập nhật thông tin diễn đàn (upsert)
exports.upsertForum = (req, res) => {
    const { id } = req.params;
    const { title, description, cover_image } = req.body;

    // Kiểm tra các trường required
    if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required' });
    }

    const forumData = { title, description, cover_image };

    if (id) {
        Forum.getForumById(id, (err, results) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            if (results.length === 0) {
                return res.status(404).json({ error: 'Forum not found' });
            }
            Forum.updateForum(id, forumData, (err, updateResults) => {
                if (err) {
                    return res.status(500).json({ error: err });
                }
                res.json({ message: 'Forum updated successfully' });
            });
        });
    } else {
        Forum.createForum(forumData, (err, insertResults) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            res.json({ id: insertResults.insertId });
        });
    }
};

// Xóa diễn đàn theo ID
exports.deleteForum = (req, res) => {
    const { id } = req.params;
    Forum.deleteForum(id, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        res.json({ message: 'Forum marked as deleted' });
    });
};

// Tham gia diễn đàn
exports.joinForum = (req, res) => {
    const { forum_id, user_id } = req.body;
    Forum.joinForum(forum_id, user_id, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        res.json({ message: 'User joined forum successfully' });
    });
};

// Tạo bài viết mới
exports.createPost = (req, res) => {
    const { forum_id, user_id, title, content, image } = req.body;

    // Kiểm tra các trường required
    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
    }

    Forum.isMember(forum_id, user_id, (err, isMember) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        if (!isMember) {
            return res.status(403).json({ error: 'User is not a member of the forum' });
        }

        const postData = { forum_id, user_id, title, content, image };
        Forum.createPost(postData, (err, results) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            res.json({ id: results.insertId });
        });
    });
};
