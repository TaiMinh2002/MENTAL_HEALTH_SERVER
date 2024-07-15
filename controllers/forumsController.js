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
    const { title, description } = req.body;
    const forumData = { title, description };

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
