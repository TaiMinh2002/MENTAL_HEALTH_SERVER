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

exports.getAllForums = async (req, res) => {
    const { page = 1, limit = 10, keyword = '', is_joined } = req.query;
    const offset = (page - 1) * limit;
    const user_id = req.user.id;

    try {
        const forums = await Forum.getAllForums(user_id, keyword, parseInt(limit), offset, is_joined);

        const total = await Forum.countAllForums(user_id, keyword, is_joined);

        res.json({
            msg: 'success',
            code: 200,
            data: {
                forums: {
                    data: forums,
                    total,
                    per_page: parseInt(limit),
                    current_page: parseInt(page),
                    last_page: Math.ceil(total / limit),
                    has_more_pages: page < Math.ceil(total / limit),
                },
            },
        });
    } catch (err) {
        console.error('Error fetching forums:', err);
        res.status(500).json({ msg: 'error', code: 500, error: 'Internal server error' });
    }
};

exports.getForumById = async (req, res) => {
    const forumId = req.params.id;

    try {
        const results = await Forum.getForumWithPosts(forumId);

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
            posts: [],
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
                        images: [],
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
            data: { forum },
        });
    } catch (err) {
        console.error('Error fetching forum by ID:', err);
        res.status(500).json({ msg: 'error', code: 500, error: 'Internal server error' });
    }
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

    try {
        const newForumId = await Forum.createForum(forumData);
        await Forum.joinForum({
            forum_id: newForumId,
            user_id: created_user_id,
            joined_at: new Date(),
        });

        res.json({ msg: 'success', code: 200, id: newForumId });
    } catch (err) {
        console.error('Error creating forum:', err);
        res.status(500).json({ msg: 'error', code: 500, error: 'Internal server error' });
    }
};

exports.updateForum = async (req, res) => {
    const { id } = req.params;
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

    const forumData = {};
    if (title) forumData.title = title;
    if (description) forumData.description = description;
    if (cover_image) forumData.cover_image = cover_image;

    try {
        const forum = await Forum.getForumById(id);

        if (!forum) {
            return res.status(404).json({ msg: 'error', code: 404, error: 'Forum not found' });
        }

        if (forum.created_user_id !== created_user_id) {
            return res.status(403).json({ msg: 'error', code: 403, error: 'Permission denied' });
        }

        await Forum.updateForum(id, forumData);

        const updatedForum = await Forum.getForumById(id);
        res.json({ msg: 'success', code: 200, data: { forum: updatedForum } });
    } catch (err) {
        console.error('Error updating forum:', err);
        res.status(500).json({ msg: 'error', code: 500, error: 'Internal server error' });
    }
};

exports.deleteForum = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    try {
        const forum = await Forum.getForumById(id);

        if (!forum) {
            return res.status(404).json({ msg: 'error', code: 404, error: 'Forum not found' });
        }

        if (forum.created_user_id !== user_id) {
            return res.status(403).json({ msg: 'error', code: 403, error: 'Permission denied' });
        }

        await Forum.deleteForum(id);
        res.json({ msg: 'success', code: 200 });
    } catch (err) {
        console.error('Error deleting forum:', err);
        res.status(500).json({ msg: 'error', code: 500, error: 'Internal server error' });
    }
};

exports.joinForum = async (req, res) => {
    const { forum_id } = req.query;
    const user_id = req.user.id;

    try {
        await Forum.joinForum({ forum_id, user_id, joined_at: new Date() });
        res.json({ msg: 'success', code: 200, forum_id });
    } catch (err) {
        console.error('Error joining forum:', err);
        res.status(500).json({ msg: 'error', code: 500, error: 'Internal server error' });
    }
};

exports.outForum = async (req, res) => {
    const { forum_id } = req.query;
    const user_id = req.user.id;

    try {
        await Forum.outForum(forum_id, user_id);
        res.json({ msg: 'success', code: 200, forum_id });
    } catch (err) {
        console.error('Error leaving forum:', err);
        res.status(500).json({ msg: 'error', code: 500, error: 'Internal server error' });
    }
};
