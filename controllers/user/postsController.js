const Post = require('../../models/user/postModel');
const bucket = require('../..//firebase');
const Forum = require('../../models/user/forumModel');

const uploadToFirebase = (file) => {
    return new Promise((resolve, reject) => {
        const blob = bucket.file(file.originalname);
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
                resolve(`https://storage.googleapis.com/${bucket.name}/${blob.name}`);
            } catch (err) {
                reject(err);
            }
        });

        blobStream.end(file.buffer);
    });
};


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
exports.upsertPost = async (req, res) => {
    const { id } = req.params;
    const { forum_id, title, content } = req.body;
    const user_id = req.user.id; // Assuming req.user contains the logged-in user's info

    let images = [];
    if (req.files) {
        try {
            // Upload multiple images to Firebase
            const uploadPromises = req.files.map(file => uploadToFirebase(file));
            images = await Promise.all(uploadPromises);
        } catch (err) {
            return res.status(500).json({ error: 'Error uploading files to Firebase' });
        }
    }

    const postData = { forum_id, user_id, title, content, images: images.join(',') };

    if (id) {
        // Update post
        Post.getPostById(id, (err, results) => {
            if (err) {
                return res.status(500).json({ error: err });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'Post not found' });
            }

            Post.updatePost(id, postData, (err) => {
                if (err) {
                    return res.status(500).json({ error: err });
                }
                res.json({ message: 'Post updated successfully' });
            });
        });
    } else {
        // Create new post
        Post.createPost(postData, (err, insertResults) => {
            if (err) {
                return res.status(500).json({ error: err });
            }

            const newPostId = insertResults.insertId;

            // Increment post count in the forum
            Forum.incrementPostCount(forum_id, (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Error updating post count' });
                }
                res.json({ message: 'Post created successfully', id: newPostId });
            });
        });
    }
};

// Xóa bài đăng theo ID
exports.deletePost = (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id; // Assuming req.user contains the logged-in user's info

    // Check if the post exists and if the current user is the owner
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

        // Proceed to delete the post
        Post.deletePost(id, (err) => {
            if (err) {
                return res.status(500).json({ error: err });
            }

            // Decrement post count in the forum
            Forum.decrementPostCount(post.forum_id, (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Error updating post count' });
                }
                res.json({ message: 'Post marked as deleted' });
            });
        });
    });
};
