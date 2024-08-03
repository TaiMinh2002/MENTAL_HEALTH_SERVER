const Forum = require('../models/forumModel');
const bucket = require('../firebase');
require('dotenv').config();

const getBaseUrl = () => {
    const serverIp = process.env.SERVER_IP || 'localhost';
    return `${serverIp.protocol}://${serverIp.hostname}:${process.env.PORT}`;
};

const uploadToFirebase = (file) => {
    return new Promise((resolve, reject) => {
        const { originalname, buffer } = file;
        const blob = bucket.file(originalname);
        const blobStream = blob.createWriteStream({
            resumable: false,
            contentType: file.mimetype
        });

        blobStream.on('error', (err) => {
            reject(err);
        });

        blobStream.on('finish', async () => {
            try {
                await blob.makePublic();
                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
                resolve(publicUrl);
            } catch (error) {
                reject(error);
            }
        });

        blobStream.end(buffer);
    });
};

// Lấy tất cả các diễn đàn
exports.getAllForums = (req, res) => {
    const { page = 1, limit = 10, keyword = '' } = req.query;
    Forum.getAllForums(page, limit, keyword, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        Forum.countAllForums(keyword, (err, countResults) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            const total = countResults[0].total;
            res.json({
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit),
                forums: results
            });
        });
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
        const forum = results[0];
        res.json(forum);
    });
};

// Tạo mới hoặc cập nhật thông tin diễn đàn (upsert)
exports.upsertForum = async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
    const created_user_id = req.user.id; // ID của người dùng đang đăng nhập
    let cover_image = null;

    if (req.file) {
        try {
            cover_image = await uploadToFirebase(req.file);
        } catch (err) {
            return res.status(500).json({ error: 'Error uploading file to Firebase' });
        }
    }

    const forumData = { title, description, cover_image, created_user_id };

    if (id) {
        // Update forum
        Forum.getForumById(id, (err, results) => {
            if (err) {
                return res.status(500).json({ error: err });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'Forum not found' });
            }

            const forum = results[0];

            // Kiểm tra nếu người dùng đang đăng nhập là người tạo forum
            if (forum.created_user_id !== created_user_id) {
                return res.status(403).json({ error: 'You do not have permission to update this forum' });
            }

            Forum.updateForum(id, forumData, (err) => {
                if (err) {
                    return res.status(500).json({ error: err });
                }
                res.json({ message: 'Forum updated successfully' });
            });
        });
    } else {
        // Create new forum
        Forum.createForum(forumData, (err, insertResults) => {
            if (err) {
                return res.status(500).json({ error: err });
            }

            const newForumId = insertResults.insertId;
            const joinData = {
                forum_id: newForumId,
                user_id: created_user_id,
                joined_at: new Date()
            };

            // Add creator to forum_members
            Forum.joinForum(joinData, (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Error adding user to forum_members' });
                }

                // Increment member count
                Forum.incrementMemberCount(newForumId, (err) => {
                    if (err) {
                        return res.status(500).json({ error: 'Error updating member count' });
                    }
                    res.json({ message: 'Forum created successfully', id: newForumId });
                });
            });
        });
    }
};

// Xóa diễn đàn theo ID
exports.deleteForum = (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id; // ID của người dùng đang đăng nhập

    Forum.getForumById(id, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Forum not found' });
        }

        const forum = results[0];

        // Kiểm tra nếu người dùng đang đăng nhập là người tạo forum
        if (forum.created_user_id !== user_id) {
            return res.status(403).json({ error: 'You do not have permission to delete this forum' });
        }

        Forum.deleteForum(id, (err) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            res.json({ message: 'Forum marked as deleted' });
        });
    });
};

// Tham gia diễn đàn
exports.joinForum = (req, res) => {
    const { forum_id } = req.body;
    const user_id = req.user.id; // Assuming req.user contains the logged-in user's info
    const joinData = {
        forum_id: forum_id,
        user_id: user_id,
        joined_at: new Date()
    };

    Forum.joinForum(joinData, (err) => {
        if (err) {
            console.error('Error adding user to forum_members:', err);
            return res.status(500).json({ error: 'Error adding user to forum_members' });
        }

        // Increment member count
        Forum.incrementMemberCount(forum_id, (err) => {
            if (err) {
                console.error('Error updating member count:', err);
                return res.status(500).json({ error: 'Error updating member count' });
            }
            res.json({ message: 'User joined forum successfully' });
        });
    });
};

//Out diễn đàn
exports.outForum = (req, res) => {
    const { forum_id } = req.body;
    const user_id = req.user.id; // Assuming req.user contains the logged-in user's info

    Forum.outForum(forum_id, user_id, (err) => {
        if (err) {
            console.error('Error updating forum_members:', err);
            return res.status(500).json({ error: 'Error updating forum_members' });
        }

        // Decrement member count
        Forum.decrementMemberCount(forum_id, (err) => {
            if (err) {
                console.error('Error updating member count:', err);
                return res.status(500).json({ error: 'Error updating member count' });
            }
            res.json({ message: 'User left forum successfully' });
        });
    });
};
