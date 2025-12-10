/**
 * MikroTik API Configuration and Connection Manager
 * @module config/mikrotik
 */

const { RouterOSAPI } = require('node-routeros');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Creates and connects a new MikroTik RouterOS client
 * @param {Object} [config] - Optional connection configuration
 * @param {string} [config.host]
 * @param {number} [config.port]
 * @param {string} [config.user]
 * @param {string} [config.password]
 * @returns {Promise<RouterOSAPI>} Connected RouterOS client
 * @throws {Error} If connection fails
 */
const getMikrotikClient = async (config = {}) => {
  const client = new RouterOSAPI({
    host: config.host || process.env.MIKROTIK_HOST,
    port: parseInt(config.port) || parseInt(process.env.MIKROTIK_PORT) || 8728,
    user: config.user || process.env.MIKROTIK_USER,
    password: config.password || process.env.MIKROTIK_PASSWORD,
    keepalive: true,
    reconnect: true
  });

  try {
    await client.connect();
    return client;
  } catch (error) {
    console.error('Failed to connect to MikroTik:', error);
    throw error;
  }
};

module.exports = {
  getMikrotikClient
};
