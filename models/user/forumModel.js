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

    db.query(query, values, callback);
  },

  getForumWithPosts: (id, callback) => {
    const query = `
        SELECT 
            forums.*,
            users.username AS created_user_name,
            posts.id AS post_id,
            posts.forum_id,
            posts.user_id,
            posts.title AS post_title, -- Lấy thêm title của post
            posts.content,
            posts.like_count,
            posts.comment_count,
            posts.created_at AS post_created_at,
            posts.updated_at AS post_updated_at,
            post_images.image AS post_image,
            post_users.username AS post_user_name -- Lấy username của người đăng post
        FROM forums
        LEFT JOIN posts ON forums.id = posts.forum_id AND posts.deleted_at IS NULL
        LEFT JOIN post_images ON posts.id = post_images.post_id
        LEFT JOIN users ON forums.created_user_id = users.id
        LEFT JOIN users AS post_users ON posts.user_id = post_users.id -- Join thêm để lấy username người đăng post
        WHERE forums.id = ? AND forums.deleted_at IS NULL`;

    db.query(query, [id], callback);
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

    const checkForumQuery = `SELECT id FROM forums WHERE id = ? AND deleted_at IS NULL`;

    db.query(checkForumQuery, [forum_id], (err, results) => {
      if (err) return callback(err);

      if (results.length === 0) {
        return callback(null, { error: 'Forum not found' });
      }

      const insertMemberQuery = `INSERT INTO forum_members SET ?`;
      db.query(insertMemberQuery, joinData, (err, insertResults) => {
        if (err) {
          console.error('SQL Error:', err);
          return callback(err);
        }

        Forum.incrementMemberCount(forum_id, (err, updateResults) => {
          if (err) {
            console.error('Error updating member count:', err);
            return callback(err);
          }

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
