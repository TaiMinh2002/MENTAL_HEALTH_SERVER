const db = require('../../config/db');

const Forum = {
  getAllForums: async (user_id, keyword, limit, offset, is_joined) => {
    let query = db('forums')
      .join('users', 'forums.created_user_id', 'users.id')
      .leftJoin('forum_members', function () {
        this.on('forums.id', 'forum_members.forum_id')
          .andOn('forum_members.user_id', '=', user_id);
      })
      .whereNull('forums.deleted_at')
      .andWhere('forums.title', 'like', `%${keyword}%`)
      .select(
        'forums.*',
        'users.username as created_user_name',
        db.raw('CASE WHEN forum_members.user_id IS NOT NULL THEN true ELSE false END AS is_joined')
      )
      .limit(limit)
      .offset(offset);
    if (is_joined !== undefined) {
      query = query.andWhere(db.raw('CASE WHEN forum_members.user_id IS NOT NULL THEN true ELSE false END'), is_joined === 'true');
    }

    return await query;
  },

  getForumWithPosts: async (id) => {
    return await db('forums')
      .leftJoin('posts', function () {
        this.on('forums.id', 'posts.forum_id').andOnNull('posts.deleted_at');
      })
      .leftJoin('post_images', 'posts.id', 'post_images.post_id')
      .leftJoin('users', 'forums.created_user_id', 'users.id')
      .leftJoin('users as post_users', 'posts.user_id', 'post_users.id')
      .where('forums.id', id)
      .whereNull('forums.deleted_at')
      .select(
        'forums.*',
        'users.username as created_user_name',
        'posts.id as post_id',
        'posts.title as post_title',
        'posts.content',
        'posts.like_count',
        'posts.comment_count',
        'posts.created_at as post_created_at',
        'posts.updated_at as post_updated_at',
        'post_images.image as post_image',
        'post_users.username as post_user_name'
      );
  },

  getForumById: async (id) => {
    return await db('forums')
      .where({ id })
      .whereNull('deleted_at')
      .first();
  },

  createForum: async (forumData) => {
    const [id] = await db('forums').insert(forumData);
    return id;
  },

  updateForum: async (id, forumData) => {
    return await db('forums')
      .where({ id })
      .whereNull('deleted_at')
      .update(forumData);
  },

  deleteForum: async (id) => {
    return await db('forums')
      .where({ id })
      .update({ deleted_at: new Date() });
  },

  joinForum: async (joinData) => {
    const forumExists = await db('forums')
      .where({ id: joinData.forum_id })
      .whereNull('deleted_at')
      .first();

    if (!forumExists) {
      throw new Error('Forum not found');
    }

    await db('forum_members').insert(joinData);
    return await db('forums')
      .where({ id: joinData.forum_id })
      .increment('member_count', 1);
  },

  outForum: async (forum_id, user_id) => {
    await db('forum_members')
      .where({ forum_id, user_id })
      .delete();
    return await db('forums')
      .where({ id: forum_id })
      .decrement('member_count', 1);
  },

  countAllForums: async (user_id, keyword, is_joined) => {
    let query = db('forums')
      .leftJoin('forum_members', function () {
        this.on('forums.id', 'forum_members.forum_id')
          .andOn('forum_members.user_id', '=', user_id);
      })
      .whereNull('forums.deleted_at')
      .andWhere('forums.title', 'like', `%${keyword}%`);

    if (is_joined !== undefined) {
      query = query.andWhere(db.raw('CASE WHEN forum_members.user_id IS NOT NULL THEN true ELSE false END'), is_joined === 'true');
    }

    const queryResult = await query.count('* as total');
    return parseInt(queryResult[0].total, 10);
  },

  incrementMemberCount: async (forum_id) => {
    return await db('forums')
      .where({ id: forum_id })
      .increment('member_count', 1);
  },

  decrementMemberCount: async (forum_id) => {
    return await db('forums')
      .where({ id: forum_id })
      .decrement('member_count', 1);
  },

  incrementPostCount: async (forum_id) => {
    return await db('forums')
      .where({ id: forum_id })
      .increment('post_count', 1);
  },

  decrementPostCount: async (forum_id) => {
    return await db('forums')
      .where({ id: forum_id })
      .decrement('post_count', 1);
  },

  checkForumExists: async (forum_id) => {
    return await db('forums')
      .where({ id: forum_id })
      .whereNull('deleted_at')
      .first();
  },
};

module.exports = Forum;
