const db = require('../config/database');

const PackageModel = {
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM packages ORDER BY name');
        return rows;
    },
    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM packages WHERE id = ?', [id]);
        return rows[0] || null;
    },
    create: async (data) => {
        const { name, price, bandwidth, description } = data;
        const [result] = await db.query(
            'INSERT INTO packages (name, price, bandwidth, description) VALUES (?, ?, ?, ?)',
            [name, price, bandwidth, description]
        );
        return result.insertId;
    },
    update: async (id, data) => {
        const { name, price, bandwidth, description } = data;
        const [result] = await db.query(
            'UPDATE packages SET name = ?, price = ?, bandwidth = ?, description = ? WHERE id = ?',
            [name, price, bandwidth, description, id]
        );
        return result.affectedRows;
    },
    delete: async (id) => {
        const [result] = await db.query('DELETE FROM packages WHERE id = ?', [id]);
        return result.affectedRows;
    }
};

module.exports = PackageModel;
