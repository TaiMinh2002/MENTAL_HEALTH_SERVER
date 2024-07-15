const Expert = require('../models/expertModel');

// Lấy tất cả các chuyên gia
exports.getAllExperts = (req, res) => {
    Expert.getAllExperts((err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        res.json(results);
    });
};

// Lấy chi tiết chuyên gia theo ID
exports.getExpertById = (req, res) => {
    const { id } = req.params;
    Expert.getExpertById(id, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Expert not found' });
        }
        res.json(results[0]);
    });
};

// Tạo mới hoặc cập nhật thông tin chuyên gia (upsert)
exports.upsertExpert = (req, res) => {
    const { id } = req.params;
    const { name, specialization, bio, contact_info, avatar } = req.body;
    const expertData = { name, specialization, bio, contact_info, avatar };

    if (id) {
        Expert.getExpertById(id, (err, results) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            if (results.length === 0) {
                return res.status(404).json({ error: 'Expert not found' });
            }
            Expert.updateExpert(id, expertData, (err, updateResults) => {
                if (err) {
                    return res.status(500).json({ error: err });
                }
                res.json({ message: 'Expert updated successfully' });
            });
        });
    } else {
        Expert.createExpert(expertData, (err, insertResults) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            res.json({ id: insertResults.insertId });
        });
    }
};

// Xóa chuyên gia theo ID
exports.deleteExpert = (req, res) => {
    const { id } = req.params;
    Expert.deleteExpert(id, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        res.json({ message: 'Expert marked as deleted' });
    });
};
