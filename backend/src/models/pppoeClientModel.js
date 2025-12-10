/**
 * PPPoE Client Model
 * @module models/pppoeClientModel
 */

const db = require('../config/database');

/**
 * @typedef {Object} PPPoEClient
 * @property {number} id - Client ID
 * @property {string} customer_id - Customer ID (optional)
 * @property {string} username - PPPoE Username
 * @property {string} full_name - Full Name (optional)
 * @property {string} password - PPPoE Password
 * @property {string} service_name - Service Name
 * @property {string} ip_address - Static IP Address (optional)
 * @property {string} mac_address - MAC Address (optional)
 * @property {string} address - Physical Address (optional)
 * @property {string} phone_number - Phone Number (optional)
 * @property {string} latitude - Latitude (optional)
 * @property {string} longitude - Longitude (optional)
 * @property {Date} created_at - Creation timestamp
 * @property {Date} updated_at - Update timestamp
 */

const PPPoEClientModel = {
  /**
   * Get all PPPoE clients
   * @returns {Promise<PPPoEClient[]>} List of clients
   */
  getAll: async () => {
    try {
      const [rows] = await db.query(`
        SELECT c.*, d.name as device_name, p.name as package_name, p.bandwidth, p.price
        FROM pppoe_clients c
        LEFT JOIN devices d ON c.device_id = d.id
        LEFT JOIN packages p ON c.package_id = p.id
      `);
      return rows;
    } catch (err) {
      throw new Error('Failed to get all PPPoE clients: ' + err.message);
    }
  },

  /**
   * Get PPPoE client by ID
   * @param {number} id - Client ID
   * @returns {Promise<PPPoEClient|null>} Client object or null
   */
  getById: async (id) => {
    try {
      const [rows] = await db.query(`
        SELECT c.*, d.name as device_name, p.name as package_name, p.bandwidth, p.price
        FROM pppoe_clients c
        LEFT JOIN devices d ON c.device_id = d.id
        LEFT JOIN packages p ON c.package_id = p.id
        WHERE c.id = ?
      `, [id]);
      return rows[0] || null;
    } catch (err) {
      throw new Error('Failed to get PPPoE client by ID: ' + err.message);
    }
  },

  /**
   * Get PPPoE client by Username
   * @param {string} username - Client Username
   * @returns {Promise<PPPoEClient|null>} Client object or null
   */
  getByUsername: async (username) => {
    try {
      const [rows] = await db.query('SELECT * FROM pppoe_clients WHERE username = ?', [username]);
      return rows[0] || null;
    } catch (err) {
      throw new Error('Failed to get PPPoE client by username: ' + err.message);
    }
  },

  /**
   * Create a new PPPoE client
   * @param {Object} clientData - Client data
   * @param {string} clientData.username - Username
   * @param {string} clientData.password - Password
   * @param {string} clientData.service_name - Service Name
   * @param {string} [clientData.ip_address] - IP Address
   * @param {string} [clientData.mac_address] - MAC Address
   * @returns {Promise<number>} Created Client ID
   */
  create: async (clientData) => {
    try {
      const { customer_id, username, full_name, password, service_name, ip_address, mac_address, address, phone_number, latitude, longitude, device_id, is_disabled, odp_id } = clientData;
      const [result] = await db.query(
        'INSERT INTO pppoe_clients (customer_id, username, full_name, password, service_name, is_disabled, ip_address, mac_address, address, phone_number, latitude, longitude, device_id, odp_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [customer_id, username, full_name, password, service_name, is_disabled || false, ip_address, mac_address, address, phone_number, latitude, longitude, device_id, odp_id]
      );
      return result.insertId;
    } catch (err) {
      throw new Error('Failed to create PPPoE client: ' + err.message);
    }
  },

  /**
   * Update a PPPoE client
   * @param {number} id - Client ID
   * @param {Object} clientData - Client data to update
   * @returns {Promise<number>} Number of affected rows
   */
  update: async (id, clientData) => {
    try {
      const { customer_id, username, full_name, password, service_name, ip_address, mac_address, address, phone_number, latitude, longitude, device_id, is_disabled, odp_id } = clientData;

      // Build query dynamically to allow partial updates
      let query = 'UPDATE pppoe_clients SET ';
      const params = [];
      const updates = [];

      if (customer_id !== undefined) { updates.push('customer_id = ?'); params.push(customer_id); }
      if (username !== undefined) { updates.push('username = ?'); params.push(username); }
      if (full_name !== undefined) { updates.push('full_name = ?'); params.push(full_name); }
      if (password !== undefined) { updates.push('password = ?'); params.push(password); }
      if (service_name !== undefined) { updates.push('service_name = ?'); params.push(service_name); }
      if (is_disabled !== undefined) { updates.push('is_disabled = ?'); params.push(is_disabled); }
      if (ip_address !== undefined) { updates.push('ip_address = ?'); params.push(ip_address); }
      if (mac_address !== undefined) { updates.push('mac_address = ?'); params.push(mac_address); }
      if (address !== undefined) { updates.push('address = ?'); params.push(address); }
      if (phone_number !== undefined) { updates.push('phone_number = ?'); params.push(phone_number); }
      if (latitude !== undefined) { updates.push('latitude = ?'); params.push(latitude); }
      if (longitude !== undefined) { updates.push('longitude = ?'); params.push(longitude); }
      if (device_id !== undefined) { updates.push('device_id = ?'); params.push(device_id); }
      if (odp_id !== undefined) { updates.push('odp_id = ?'); params.push(odp_id); }

      if (updates.length === 0) return 0;

      query += updates.join(', ') + ' WHERE id = ?';
      params.push(id);

      const [result] = await db.query(query, params);
      return result.affectedRows;
    } catch (err) {
      throw new Error('Failed to update PPPoE client: ' + err.message);
    }
  },

  /**
   * Update client status
   * @param {number} id - Client ID
   * @param {string} status - Status (online/offline/isolir)
   * @returns {Promise<number>} Number of affected rows
   */
  updateStatus: async (id, status) => {
    try {
      const [result] = await db.query('UPDATE pppoe_clients SET status = ? WHERE id = ?', [status, id]);
      console.log(`[updateStatus] id: ${id}, status: ${status}, affectedRows: ${result.affectedRows}`);
      return result.affectedRows;
    } catch (err) {
      console.error(`[updateStatus][ERROR] id: ${id}, status: ${status}, error: ${err.message}`);
      throw new Error('Failed to update client status: ' + err.message);
    }
  },

  /**
   * Delete a PPPoE client
   * @param {number} id - Client ID
   * @returns {Promise<number>} Number of affected rows
   */
  delete: async (id) => {
    try {
      const [result] = await db.query('DELETE FROM pppoe_clients WHERE id = ?', [id]);
      return result.affectedRows;
    } catch (err) {
      throw new Error('Failed to delete PPPoE client: ' + err.message);
    }
  },

  /**
   * Count all PPPoE clients
   * @returns {Promise<number>} Total number of clients
   */
  countAll: async () => {
    try {
      const [rows] = await db.query('SELECT COUNT(*) as count FROM pppoe_clients');
      return rows[0].count;
    } catch (err) {
      throw new Error('Failed to count PPPoE clients: ' + err.message);
    }
  },

  /**
   * Generate next Customer ID based on date (YYMMDDXX)
   * @returns {Promise<string>} Next Customer ID
   */
  getNextCustomerId: async () => {
    try {
      const date = new Date();
      const year = date.getFullYear().toString().substr(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const prefix = `${year}${month}${day}`;

      const [rows] = await db.query(
        'SELECT customer_id FROM pppoe_clients WHERE customer_id LIKE ? ORDER BY LENGTH(customer_id) DESC, customer_id DESC LIMIT 1',
        [`${prefix}%`]
      );

      let sequence = 1;
      if (rows.length > 0 && rows[0].customer_id) {
        const lastId = rows[0].customer_id;
        const lastSequence = parseInt(lastId.substr(6));
        if (!isNaN(lastSequence)) {
          sequence = lastSequence + 1;
        }
      }

      return `${prefix}${sequence.toString().padStart(2, '0')}`;
    } catch (err) {
      throw new Error('Failed to generate next customer ID: ' + err.message);
    }
  }
};

module.exports = PPPoEClientModel;
