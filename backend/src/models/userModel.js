const db = require('../config/database');
const bcrypt = require('bcryptjs');

const UserModel = {
    findByUsername: async (username) => {
        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        return rows[0];
    },
    create: async (username, password) => {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
        return result.insertId;
    },
    count: async () => {
        const [rows] = await db.query('SELECT COUNT(*) as count FROM users');
        return rows[0].count;
    }
};

module.exports = UserModel;