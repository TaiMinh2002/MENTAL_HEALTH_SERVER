const Expert = require('../models/expertModel');
const bucket = require('../firebase'); // Import Firebase Storage bucket
const { uploadAvatar } = require('../config/multer'); // Import middleware uploadAvatar

// Tải ảnh lên Firebase Storage
const uploadToFirebase = (file) => {
    return new Promise((resolve, reject) => {
        const { originalname, buffer } = file;
        const blob = bucket.file(originalname);
        const blobStream = blob.createWriteStream({
            metadata: {
                contentType: file.mimetype
            }
        });

        blobStream.on('error', (err) => {
            reject(err);
        });

        blobStream.on('finish', async () => {
            try {
                await blob.makePublic(); // Làm cho ảnh công khai
                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
                resolve(publicUrl);
            } catch (error) {
                reject(error);
            }
        });

        blobStream.end(buffer);
    });
};

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
exports.upsertExpert = async (req, res) => {
    const { id } = req.params;
    const { name, specialization, bio, contact_info, phone_number } = req.body;
    let avatar = null;

    if (req.file) {
        try {
            avatar = await uploadToFirebase(req.file);
        } catch (error) {
            return res.status(500).json({ error: 'Error uploading file to Firebase' });
        }
    }

    const expertData = { name, specialization, bio, contact_info, phone_number, avatar };

    const checkAndUpsert = () => {
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

    Expert.checkPhoneNumberExists(phone_number, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        if (results.length > 0) {
            if (id && results[0].id === parseInt(id)) {
                checkAndUpsert(); // Cho phép cập nhật nếu ID khớp
            } else {
                return res.status(400).json({ error: 'Phone number already exists' });
            }
        } else {
            checkAndUpsert();
        }
    });
};

// Xóa chuyên gia theo ID
exports.deleteExpert = (req, res) => {
    const { id } = req.params;
    Expert.getExpertById(id, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Expert not found' });
        }
        Expert.deleteExpert(id, (err, results) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            res.json({ message: 'Expert marked as deleted' });
        });
    });
};
