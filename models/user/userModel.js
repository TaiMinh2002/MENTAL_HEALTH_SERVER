const db = require('../../config/db');
const User = {
  getAllUsers: async (page, limit, keyword) => {
    const offset = (page - 1) * limit;
    return await db('users')
      .whereNull('deleted_at')
      .andWhere('username', 'like', `%${keyword}%`)
      .limit(limit)
      .offset(offset);
  },

  getUserById: async (id) => {
    return await db('users')
      .where({ id })
      .whereNull('deleted_at')
      .first();
  },

  getUserByEmailOrPhoneNumber: async (identifier) => {
    return await db('users')
      .where((qb) => {
        qb.where('email', identifier).orWhere('phone_number', identifier);
      })
      .whereNull('deleted_at')
      .first();
  },

  countAllUsers: async (keyword) => {
    const result = await db('users')
      .whereNull('deleted_at')
      .andWhere('username', 'like', `%${keyword}%`)
      .count('* as total');
    return result[0].total;
  },

  createUser: async (userData) => {
    const [id] = await db('users').insert(userData);
    return id;
  },

  updateUser: async (id, userData) => {
    return await db('users')
      .where({ id })
      .whereNull('deleted_at')
      .update(userData);
  },

  deleteUser: async (id) => {
    const deletedAt = new Date();
    return await db('users')
      .where({ id })
      .update({ deleted_at: deletedAt });
  },

  checkIfUserExists: async (id) => {
    return await db('users')
      .where({ id })
      .whereNull('deleted_at')
      .first();
  },

  pauseUser: async (id) => {
    return await db('users')
      .where({ id })
      .whereNull('deleted_at')
      .update({ status: 2 });
  },

  updateUserByExpertId: async (expertId, userData) => {
    return await db('users')
      .where({ expert_id: expertId })
      .whereNull('deleted_at')
      .update(userData);
  },
};

module.exports = User;
