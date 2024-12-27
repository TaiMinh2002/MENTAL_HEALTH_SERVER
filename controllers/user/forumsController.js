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

exports.getAllForums = (req, res) => {
    const { page = 1, limit = 10, keyword = '' } = req.query;
    const offset = (page > 0 ? page - 1 : 0) * limit;
    const user_id = req.user.id;

    Forum.getAllForums(user_id, keyword, limit, offset, (err, results) => {
        if (err) {
            return res.status(500).json({ msg: 'error', code: 500, error: err });
        }

        Forum.countAllForums(user_id, keyword, (err, countResults) => {
            if (err) {
                return res.status(500).json({ msg: 'error', code: 500, error: err });
            }

            const total = countResults[0].total;
            const totalPages = Math.ceil(total / limit);

            res.json({
                msg: 'success',
                code: 200,
                data: {
                    forums: {
                        data: results,
                        total: total,
                        per_page: parseInt(limit),
                        current_page: parseInt(page),
                        last_page: totalPages,
                        has_more_pages: parseInt(page) < totalPages
                    }
                }
            });
        });
    });
};

exports.getForumById = (req, res) => {
    const forumId = req.params.id;

    Forum.getForumWithPosts(forumId, (err, results) => {
        if (err) {
            return res.status(500).json({ msg: 'error', code: 500, error: 'Failed to fetch forum with posts' });
        }

        if (results.length === 0) {
            return res.status(404).json({ msg: 'error', code: 404, error: 'Forum not found' });
        }

        const forum = {
            id: results[0].id,
            title: results[0].title,
            description: results[0].description,
            cover_image: results[0].cover_image,
            member_count: results[0].member_count,
            post_count: results[0].post_count,
            created_user_id: results[0].created_user_id,
            created_user_name: results[0].created_user_name,
            created_at: results[0].created_at,
            updated_at: results[0].updated_at,
            posts: []
        };

        const postsMap = new Map();
        results.forEach((row) => {
            if (row.post_id) {
                if (!postsMap.has(row.post_id)) {
                    postsMap.set(row.post_id, {
                        post_id: row.post_id,
                        forum_id: row.forum_id,
                        user_id: row.user_id,
                        username: row.post_user_name,
                        title: row.post_title,
                        content: row.content,
                        like_count: row.like_count,
                        comment_count: row.comment_count,
                        post_created_at: row.post_created_at,
                        post_updated_at: row.post_updated_at,
                        images: []
                    });
                }

                if (row.post_image) {
                    postsMap.get(row.post_id).images.push(row.post_image);
                }
            }
        });

        forum.posts = Array.from(postsMap.values());

        res.json({
            msg: 'success',
            code: 200,
            data: {
                forum
            }
        });
    });
};

exports.createForum = async (req, res) => {
    const { title, description } = req.body;
    const created_user_id = req.user.id;
    let cover_image = null;

    if (req.files && req.files.cover_image) {
        try {
            const file = req.files.cover_image[0];
            cover_image = await uploadToUploadcare(file);
        } catch (err) {
            return res.status(500).json({ error: 'Error uploading file to Uploadcare' });
        }
    }

    const forumData = { title, description, cover_image, created_user_id };

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

        Forum.joinForum(joinData, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error adding user to forum_members' });
            }

            res.json({ message: 'success', code: 200, id: newForumId });
        });
    });
};

exports.updateForum = async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
    const created_user_id = req.user.id;
    let cover_image = null;

    if (req.file) {
        try {
            cover_image = await uploadToUploadcare(req.file);
        } catch (err) {
            return res.status(500).json({ msg: 'error', code: 500, error: 'Error uploading file to Uploadcare' });
        }
    }

    const forumData = {};
    if (title) forumData.title = title;
    if (description) forumData.description = description;
    if (cover_image) forumData.cover_image = cover_image;

    // Kiểm tra nếu không có trường nào để cập nhật
    if (Object.keys(forumData).length === 0) {
        return res.status(400).json({ msg: 'error', code: 400, error: 'No fields to update' });
    }

    Forum.getForumById(id, (err, results) => {
        if (err) {
            return res.status(500).json({ msg: 'error', code: 500, error: err });
        }

        if (results.length === 0) {
            return res.status(404).json({ msg: 'error', code: 404, error: 'Forum not found' });
        }

        const forum = results[0];

        if (forum.created_user_id !== created_user_id) {
            return res.status(403).json({ msg: 'error', code: 403, error: 'You do not have permission to update this forum' });
        }

        Forum.updateForum(id, forumData, (err) => {
            if (err) {
                return res.status(500).json({ msg: 'error', code: 500, error: err });
            }

            // Fetch updated forum data
            Forum.getForumById(id, (err, updatedResults) => {
                if (err) {
                    return res.status(500).json({ msg: 'error', code: 500, error: err });
                }

                const updatedForum = updatedResults[0];
                res.json({
                    msg: 'success',
                    code: 200,
                    data: {
                        forum: updatedForum
                    }
                });
            });
        });
    });
};

exports.deleteForum = (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    Forum.getForumById(id, (err, results) => {
        if (err) {
            return res.status(500).json({ msg: 'error', code: 500, error: 'Internal server error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ msg: 'error', code: 404, error: 'Forum not found' });
        }

        const forum = results[0];

        if (forum.created_user_id !== user_id) {
            return res.status(403).json({ msg: 'error', code: 403, error: 'You do not have permission to delete this forum' });
        }

        Forum.deleteForum(id, (err) => {
            if (err) {
                return res.status(500).json({ msg: 'error', code: 500, error: err });
            }
            res.json({ msg: 'success', code: 200 });
        });
    });
};

exports.joinForum = (req, res) => {
    const { forum_id } = req.query;
    const user_id = req.user.id;

    const joinData = {
        forum_id: forum_id,
        user_id: user_id,
        joined_at: new Date()
    };

    Forum.joinForum(joinData, (err, result) => {
        if (err) {
            console.error('Error adding user to forum_members:', err);
            return res.status(500).json({ msg: 'error', code: 500, error: 'Error adding user to forum_members' });
        }

        if (result && result.error) {
            return res.status(404).json({ msg: 'error', code: 404, error: 'Forum not found' });
        }

        res.json({ msg: 'success', code: 200, forum_id });
    });
};

exports.outForum = (req, res) => {
    const { forum_id } = req.query;
    const user_id = req.user.id;

    Forum.outForum(forum_id, user_id, (err) => {
        if (err) {
            console.error('Error updating forum_members:', err);
            return res.status(500).json({ msg: 'error', code: 500, error: 'Error updating forum_members' });
        }

        Forum.decrementMemberCount(forum_id, (err) => {
            if (err) {
                console.error('Error updating member count:', err);
                return res.status(500).json({ msg: 'error', code: 500, error: 'Error updating member count' });
            }

            res.json({ msg: 'success', code: 200, forum_id });
        });
    });
};
