const db = require('../config/database');

const DeviceModel = {
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM devices ORDER BY created_at DESC');
        return rows;
    },

    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM devices WHERE id = ?', [id]);
        return rows[0];
    },

    create: async (deviceData) => {
        const { name, ip_address, username, password, type, port, description } = deviceData;
        const [result] = await db.query(
            'INSERT INTO devices (name, ip_address, username, password, type, port, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, ip_address, username, password, type, port, description]
        );
        return result.insertId;
    },

    update: async (id, deviceData) => {
        const { name, ip_address, username, password, type, port, description } = deviceData;
        const [result] = await db.query(
            'UPDATE devices SET name = ?, ip_address = ?, username = ?, password = ?, type = ?, port = ?, description = ? WHERE id = ?',
            [name, ip_address, username, password, type, port, description, id]
        );
        return result.affectedRows;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM devices WHERE id = ?', [id]);
        return result.affectedRows;
    }
};

module.exports = DeviceModel;
