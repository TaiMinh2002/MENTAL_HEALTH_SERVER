const db = require('../../config/db');

const Forum = {
  getAllForums: (user_id, keyword, limit, offset, callback) => {
    const query = `
            SELECT forums.*, users.username AS created_user_name,
                CASE
                    WHEN forum_members.user_id IS NOT NULL THEN true
                    ELSE false
                END AS is_joined
            FROM forums
            JOIN users ON forums.created_user_id = users.id
            LEFT JOIN forum_members ON forums.id = forum_members.forum_id AND forum_members.user_id = ?
            WHERE forums.deleted_at IS NULL AND forums.title LIKE ?
            LIMIT ? OFFSET ?`;

    const values = [user_id, `%${keyword}%`, parseInt(limit), parseInt(offset)];

    // Gọi query và truyền callback
    db.query(query, values, callback);
  },

  getForumWithPosts: (id, callback) => {
    const query = `
        SELECT forums.*, posts.id AS post_id, posts.forum_id, posts.user_id, 
               posts.like_count, posts.comment_count, posts.content, 
               posts.created_at AS post_created_at, posts.updated_at AS post_updated_at,
               post_images.image AS post_image, users.username AS created_user_name
        FROM forums
        LEFT JOIN posts ON forums.id = posts.forum_id
        LEFT JOIN post_images ON posts.id = post_images.post_id
        LEFT JOIN users ON forums.created_user_id = users.id
        WHERE forums.id = ? AND forums.deleted_at IS NULL;
    `;

    db.query(query, [id], (err, results) => {
      if (err) {
        console.error('Error retrieving forum with posts:', err);
        return callback(err);
      }

      if (results.length === 0) {
        return callback(null, { message: 'Forum not found' });
      }

      // Structure the forum data with posts and images
      const forum = {
        id: results[0].id,
        title: results[0].title,
        description: results[0].description,
        cover_image: results[0].cover_image,
        created_user_id: results[0].created_user_id,
        created_user_name: results[0].created_user_name, // Added user's name
        created_at: results[0].created_at,
        updated_at: results[0].updated_at,
        posts: results.reduce((acc, post) => {
          // Check if the post already exists in the accumulated posts
          const existingPost = acc.find(p => p.post_id === post.post_id);

          if (existingPost) {
            // If the post exists, push the new image to its images array
            existingPost.images.push(post.post_image);
          } else {
            // If the post does not exist, create a new post object
            acc.push({
              post_id: post.post_id,
              forum_id: post.forum_id,
              user_id: post.user_id,
              like_count: post.like_count,
              comment_count: post.comment_count,
              content: post.content,
              post_created_at: post.post_created_at,
              post_updated_at: post.post_updated_at,
              images: post.post_image ? [post.post_image] : [] // Initialize with the first image
            });
          }

          return acc;
        }, []) // Initial empty array for accumulating posts
      };

      callback(null, forum);
    });
  },

  getForumById: (id, callback) => {
    db.query('SELECT * FROM forums WHERE id = ? AND deleted_at IS NULL', [id], callback);
  },

  createForum: (forumData, callback) => {
    db.query('INSERT INTO forums SET ?', forumData, callback);
  },

  updateForum: (id, forumData, callback) => {
    db.query('UPDATE forums SET ? WHERE id = ?', [forumData, id], callback);
  },

  deleteForum: (id, callback) => {
    const deleted_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    db.query('UPDATE forums SET deleted_at = ? WHERE id = ?', [deleted_at, id], callback);
  },

  joinForum: (joinData, callback) => {
    const { forum_id, user_id } = joinData;

    // Kiểm tra forum_id có tồn tại hay không
    const checkForumQuery = `SELECT id FROM forums WHERE id = ? AND deleted_at IS NULL`;

    db.query(checkForumQuery, [forum_id], (err, results) => {
      if (err) return callback(err);

      if (results.length === 0) {
        // Nếu không tìm thấy forum_id
        return callback(null, { error: 'Forum not found' });
      }

      // Thêm user vào forum_members
      const insertMemberQuery = `INSERT INTO forum_members SET ?`;
      db.query(insertMemberQuery, joinData, (err, insertResults) => {
        if (err) {
          console.error('SQL Error:', err);
          return callback(err);
        }

        // Sau khi thêm user thành công, tăng member_count
        Forum.incrementMemberCount(forum_id, (err, updateResults) => {
          if (err) {
            console.error('Error updating member count:', err);
            return callback(err);
          }

          // Trả về kết quả thành công
          callback(null, insertResults);
        });
      });
    });
  },

  outForum: (forum_id, user_id, callback) => {
    const deleteQuery = `DELETE FROM forum_members WHERE forum_id = ? AND user_id = ?`;

    db.query(deleteQuery, [forum_id, user_id], (err, results) => {
      if (err) {
        console.error('SQL Error:', err);
        return callback(err);
      }
      callback(null, results);
    });
  },

  incrementMemberCount: (forum_id, callback) => {
    const query = `UPDATE forums SET member_count = member_count + 1 WHERE id = ?`;
    db.query(query, [forum_id], (err, results) => {
      if (err) {
        console.error('SQL Error:', err);
        return callback(err);
      }
      callback(null, results);
    });
  },

  decrementMemberCount: (forum_id, callback) => {
    const query = `UPDATE forums SET member_count = member_count - 1 WHERE id = ?`;
    db.query(query, [forum_id], (err, results) => {
      if (err) {
        console.error('SQL Error:', err);
        return callback(err);
      }
      callback(null, results);
    });
  },

  countAllForums: (user_id, keyword, callback) => {
    const query = `
            SELECT COUNT(*) AS total
            FROM forums
            LEFT JOIN forum_members ON forums.id = forum_members.forum_id AND forum_members.user_id = ?
            WHERE forums.deleted_at IS NULL AND forums.title LIKE ?`;

    const values = [user_id, `%${keyword}%`];

    // Gọi query và truyền callback
    db.query(query, values, callback);
  },

  incrementPostCount: (forum_id, callback) => {
    db.query('UPDATE forums SET post_count = post_count + 1 WHERE id = ?', [forum_id], (err, results) => {
      if (err) {
        console.error('SQL Error:', err);
      }
      callback(err, results);
    });
  },

  decrementPostCount: (forum_id, callback) => {
    db.query('UPDATE forums SET post_count = post_count - 1 WHERE id = ?', [forum_id], (err, results) => {
      if (err) {
        console.error('SQL Error:', err);
      }
      callback(err, results);
    });
  }
};

module.exports = Forum;
