const db = require('../config/db');

const User = {
  getAllUsers: (page, limit, keyword, callback) => {
    const offset = (page - 1) * limit;
    const query = `SELECT * FROM users WHERE deleted_at IS NULL AND username LIKE ? LIMIT ? OFFSET ?`;
    const values = [`%${keyword}%`, parseInt(limit), offset];
    db.query(query, values, (err, results) => {
      if (err) {
        return callback(err, null);
      }
      return callback(null, results);
    });
  },
  getUserById: (id, callback) => {
    db.query('SELECT * FROM users WHERE id = ? AND deleted_at IS NULL', [id], (err, results) => {
      if (err) {
        return callback(err, null);
      }
      return callback(null, results);
    });
  },
  getUserByEmail: (email, callback) => {
    db.query('SELECT * FROM USERS WHERE email = ? AND deleted_at IS NULL', [email], (err, results) => {
      if (err) {
        return callback(err, null);
      }
      return callback(null, results);
    });
  },
  countAllUsers: (keyword, callback) => {
    const query = `SELECT COUNT(*) AS total FROM users WHERE deleted_at IS NULL AND username LIKE ?`;
    const value = `%${keyword}%`;
    db.query(query, [value], (err, results) => {
      if (err) {
        return callback(err, null);
      }
      return callback(null, results);
    });
  },
  createUser: (userData, callback) => {
    db.query('INSERT INTO USERS SET ?', userData, (err, results) => {
      if (err) {
        return callback(err, null);
      }
      return callback(null, results);
    });
  },
  updateUser: (id, userData, callback) => {
    db.query('UPDATE users SET ? WHERE id = ? AND deleted_at IS NULL', [userData, id], (err, results) => {
      if (err) {
        return callback(err, null);
      }
      return callback(null, results);
    });
  },
  deleteUser: (id, callback) => {
    const deletedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    db.query('UPDATE users SET deleted_at = ? WHERE id = ?', [deletedAt, id], (err, results) => {
      if (err) {
        return callback(err, null);
      }
      return callback(null, results);
    });
  },
  checkIfUserExists: (id, callback) => {
    db.query('SELECT * FROM users WHERE id = ? AND deleted_at IS NULL', [id], (err, results) => {
      if (err) {
        return callback(err, null);
      }
      return callback(null, results);
    });
  },
  pauseUser: (id, callback) => {
    const status = 2;
    db.query('UPDATE users SET status = ? WHERE id = ? AND deleted_at IS NULL', [status, id], (err, results) => {
      if (err) {
        return callback(err, null);
      }
      return callback(null, results);
    });
  }
};

module.exports = User;
