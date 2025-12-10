const db = require('../config/database');

const OdpModel = {
    getAll: async () => {
        const [rows] = await db.query(`
            SELECT odps.*, pops.name as pop_name 
            FROM odps 
            LEFT JOIN pops ON odps.pop_id = pops.id 
            ORDER BY odps.name ASC
        `);
        return rows;
    },

    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM odps WHERE id = ?', [id]);
        return rows[0];
    },

    create: async (data) => {
        const { name, code, pop_id, address, latitude, longitude, total_ports, description } = data;
        const [result] = await db.query(
            'INSERT INTO odps (name, code, pop_id, address, latitude, longitude, total_ports, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [name, code, pop_id, address, latitude, longitude, total_ports, description]
        );
        return result.insertId;
    },

    update: async (id, data) => {
        const { name, code, pop_id, address, latitude, longitude, total_ports, description } = data;
        const [result] = await db.query(
            'UPDATE odps SET name = ?, code = ?, pop_id = ?, address = ?, latitude = ?, longitude = ?, total_ports = ?, description = ? WHERE id = ?',
            [name, code, pop_id, address, latitude, longitude, total_ports, description, id]
        );
        return result.affectedRows;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM odps WHERE id = ?', [id]);
        return result.affectedRows;
    }
};

module.exports = OdpModel;
