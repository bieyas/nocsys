const db = require('../config/database');

const PopModel = {
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM pops ORDER BY name ASC');
        return rows;
    },

    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM pops WHERE id = ?', [id]);
        return rows[0];
    },

    create: async (data) => {
        const { name, code, address, latitude, longitude, description } = data;
        const [result] = await db.query(
            'INSERT INTO pops (name, code, address, latitude, longitude, description) VALUES (?, ?, ?, ?, ?, ?)',
            [name, code, address, latitude, longitude, description]
        );
        return result.insertId;
    },

    update: async (id, data) => {
        const { name, code, address, latitude, longitude, description } = data;
        const [result] = await db.query(
            'UPDATE pops SET name = ?, code = ?, address = ?, latitude = ?, longitude = ?, description = ? WHERE id = ?',
            [name, code, address, latitude, longitude, description, id]
        );
        return result.affectedRows;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM pops WHERE id = ?', [id]);
        return result.affectedRows;
    }
};

module.exports = PopModel;
