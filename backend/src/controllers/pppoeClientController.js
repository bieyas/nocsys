/**
 * Update package (subscription) for a client
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.updateClientPackage = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { package_id } = req.body;
    if (!package_id) return res.status(400).json({ success: false, message: 'package_id wajib diisi' });
    const affected = await PPPoEClientModel.update(id, { package_id });
    if (!affected) return res.status(404).json({ success: false, message: 'Client not found' });
    res.json({ success: true, message: 'Paket langganan berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
/**
 * Sinkronisasi status client: online, offline, isolir
 * @param {number} deviceId - ID device MikroTik
 * @returns {Promise<{updated: number, total: number}>}
 */
exports.syncClientStatus = async (deviceId) => {
  const dbClients = await PPPoEClientModel.getAll();
  const mkClient = await getClientForDevice(deviceId);
  const sessions = await mkClient.write(['/ppp/active/print', '?service=pppoe']);
  await mkClient.close();

  const onlineSet = new Set(sessions.map(s => s.name));
  const updates = [];

  for (const client of dbClients) {
    let newStatus = 'offline';
    if (client.ip_address && client.ip_address.startsWith('10.127.')) {
      newStatus = 'isolir';
    } else if (onlineSet.has(client.username)) {
      newStatus = 'online';
    }
    if (client.status !== newStatus) {
      updates.push(PPPoEClientModel.updateStatus(client.id, newStatus));
    }
  }

  // Batched update (limit concurrency to avoid DB overload)
  const limit = 10;
  for (let i = 0; i < updates.length; i += limit) {
    await Promise.allSettled(updates.slice(i, i + limit));
  }
  return { updated: updates.length, total: dbClients.length };
};
/**
 * Get list of online PPPoE usernames
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
exports.getOnlineUsernames = async (req, res) => {
  try {
    // Ambil semua client dari DB
    const clients = await PPPoEClientModel.getAll();
    // Pastikan hasilnya array
    const rows = Array.isArray(clients) ? clients : [];
    const onlineUsernames = rows
      .filter(client => client.status === 'online')
      .map(client => client.username);
    res.json({ success: true, data: onlineUsernames });
  } catch (error) {
    console.error('Error fetching online usernames:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch online usernames', error: error.message });
  }
};
/**
 * Toggle status (enable/disable) untuk satu atau banyak client
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
exports.toggleStatus = async (req, res) => {
  const { ids, is_disabled } = req.body;
  if (!ids || !Array.isArray(ids) || typeof is_disabled === 'undefined') {
    return res.status(400).json({ success: false, message: 'IDs dan is_disabled wajib diisi' });
  }
  try {
    let updated = 0;
    for (const id of ids) {
      const affected = await PPPoEClientModel.update(id, { is_disabled });
      if (affected > 0) updated++;
    }
    res.json({ success: true, message: 'Status berhasil diubah', updated_count: updated });
  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengubah status', error: error.message });
  }
};
/**
 * PPPoE Client Controller
 * @module controllers/pppoeClientController
 */

const PPPoEClientModel = require('../models/pppoeClientModel');
const DeviceModel = require('../models/deviceModel');
const { getMikrotikClient } = require('../config/mikrotik');
const xlsx = require('xlsx');

const getClientForDevice = async (deviceId) => {
  if (!deviceId) return getMikrotikClient(); // Fallback to .env

  const device = await DeviceModel.getById(deviceId);
  if (!device) throw new Error('Device not found');

  return getMikrotikClient({
    host: device.ip_address,
    port: device.port,
    user: device.username,
    password: device.password
  });
};

const getBandwidthUsage = async (client) => {
  try {
    // 1. Find potential WAN interface
    // We look for interface named 'ether1' or 'WAN' or 'ether-wan'
    const interfaces = await client.write('/interface/print');
    let wanInterface = interfaces.find(i => i.name.toLowerCase().includes('wan') || i.name === 'ether1');

    if (!wanInterface) {
      // Fallback: first running ethernet interface
      wanInterface = interfaces.find(i => i.running === 'true' && i.type === 'ether');
    }

    if (!wanInterface) return { rx: 0, tx: 0 };

    // 2. Monitor traffic
    const traffic = await client.write(['/interface/monitor-traffic', `=interface=${wanInterface.name}`, '=once']);

    if (traffic && traffic.length > 0) {
      return {
        rx: parseInt(traffic[0]['rx-bits-per-second']) || 0,
        tx: parseInt(traffic[0]['tx-bits-per-second']) || 0
      };
    }
    return { rx: 0, tx: 0 };
  } catch (err) {
    console.error('Error getting bandwidth:', err);
    return { rx: 0, tx: 0 };
  }
};

const addClientInternal = async (clientData) => {
  let mikrotikClient;
  try {
    const { customer_id, username, full_name, password, service_name, ip_address, mac_address, address, phone_number, latitude, longitude, device_id, odp_id, sync_mikrotik = true } = clientData;

    // Basic validation
    if (!username || !password || !service_name) {
      throw new Error('Username, password, and service_name are required');
    }

    if (!device_id) {
      throw new Error('Device ID is required');
    }

    // Check if user already exists in DB
    const existingUser = await PPPoEClientModel.getByUsername(username);
    if (existingUser) {
      throw new Error('Username already exists');
    }

    let mikrotikId = null;

    // Create in MikroTik first (if sync enabled)
    if (sync_mikrotik) {
      mikrotikClient = await getClientForDevice(device_id);

      const mikrotikData = ['/ppp/secret/add'];
      mikrotikData.push(`=name=${username}`);
      mikrotikData.push(`=password=${password}`);
      mikrotikData.push(`=service=${service_name}`);
      mikrotikData.push(`=profile=default`);

      if (ip_address) mikrotikData.push(`=remote-address=${ip_address}`);
      if (mac_address) mikrotikData.push(`=caller-id=${mac_address}`);

      const pppSecret = await mikrotikClient.write(mikrotikData);
      mikrotikId = pppSecret.id;
    }

    // If successful in MikroTik (or skipped), create in DB
    const newCustomerId = customer_id || await PPPoEClientModel.getNextCustomerId();
    const newFullName = full_name || username.toUpperCase();

    const clientId = await PPPoEClientModel.create({
      customer_id: newCustomerId,
      username,
      full_name: newFullName,
      password,
      service_name,
      ip_address,
      mac_address,
      address,
      phone_number,
      latitude,
      longitude,
      device_id,
      odp_id // <-- fix: simpan ODP
    });

    return {
      id: clientId,
      customer_id: newCustomerId,
      full_name: newFullName,
      mikrotik_id: mikrotikId
    };
  } finally {
    if (mikrotikClient) mikrotikClient.close();
  }
};


/**
 * Sync clients from MikroTik to Database
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
exports.syncClients = async (req, res) => {
  let client;
  try {
    const { device_id } = req.body;
    client = await getClientForDevice(device_id);

    // 1. Get Active PPPoE Sessions
    // Note: 'service' property in /ppp/active usually indicates the service type (pppoe, l2tp, etc.)
    const activeSessions = await client.write(['/ppp/active/print', '?service=pppoe']);

    // 2. Get All Secrets (to find passwords for active users)
    // We try to get secrets to fill in details like password, but we won't skip if missing.
    let secretMap = new Map();
    try {
      const allSecrets = await client.write('/ppp/secret/print');
      allSecrets.forEach(s => secretMap.set(s.name, s));
    } catch (err) {
      console.warn('Failed to fetch secrets, proceeding with active sessions only:', err.message);
    }

    let syncedCount = 0;
    let errorCount = 0;
    let firstError = null;

    for (const session of activeSessions) {
      try {
        const username = session.name;
        const secret = secretMap.get(username);

        // Use secret data if available, otherwise use defaults/placeholders
        // Active session has: name, service, caller-id, address, uptime, etc.

        const existingClient = await PPPoEClientModel.getByUsername(username);

        const clientData = {
          username: username,
          password: secret ? (secret.password || '') : 'unknown', // Placeholder if no secret
          service_name: session.service || 'pppoe',
          is_disabled: secret ? (secret.disabled === 'true' || secret.disabled === true) : false,
          ip_address: session['address'] || (secret ? secret['remote-address'] : null),
          mac_address: session['caller-id'] || (secret ? secret['caller-id'] : null),
          // Preserve existing extra fields if updating
          customer_id: existingClient ? existingClient.customer_id : null,
          full_name: existingClient ? existingClient.full_name : null,
          address: existingClient ? existingClient.address : null,
          phone_number: existingClient ? existingClient.phone_number : null,
          latitude: existingClient ? existingClient.latitude : null,
          longitude: existingClient ? existingClient.longitude : null,
          device_id: device_id || (existingClient ? existingClient.device_id : null)
        };

        if (existingClient) {
          // Update existing client
          await PPPoEClientModel.update(existingClient.id, clientData);
        } else {
          // Create new client
          // Generate Customer ID and Full Name
          clientData.customer_id = await PPPoEClientModel.getNextCustomerId();
          clientData.full_name = username.toUpperCase();

          await PPPoEClientModel.create(clientData);
        }
        syncedCount++;
      } catch (err) {
        console.error(`Error syncing client ${session.name}:`, err);
        if (!firstError) firstError = err.message;
        errorCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: 'Synchronization from Active Sessions completed',
      data: {
        total_active_pppoe: activeSessions.length,
        synced: syncedCount,
        errors: errorCount,
        first_error: firstError
      }
    });

  } catch (error) {
    console.error('Error syncing clients:', error);
    res.status(500).json({
      success: false,
      message: `Sync failed: ${error.message}`,
      error: error.message,
      stack: error.stack
    });
  } finally {
    if (client) client.close();
  }
};

/**
 * Get dashboard statistics
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Get Total Clients from DB
    const totalClients = await PPPoEClientModel.countAll();

    // 2. Get Active Sessions & Bandwidth from ALL MikroTik Devices
    let activeCount = 0;
    let totalRx = 0;
    let totalTx = 0;

    const devices = await DeviceModel.getAll();

    // Process devices in parallel or sequence? Sequence is safer for resource usage, parallel is faster.
    // Let's do parallel with Promise.allSettled to handle failures gracefully.
    const devicePromises = devices.map(async (device) => {
      let client;
      try {
        client = await getClientForDevice(device.id);

        // Get Active Sessions
        const activeSessions = await client.write(['/ppp/active/print', '?service=pppoe']);
        const sessionCount = activeSessions.length;

        // Get Bandwidth
        const bandwidth = await getBandwidthUsage(client);

        return { sessionCount, bandwidth };
      } catch (err) {
        console.error(`Failed to get stats from device ${device.name} (${device.ip_address}):`, err.message);
        return { sessionCount: 0, bandwidth: { rx: 0, tx: 0 } };
      } finally {
        if (client) client.close();
      }
    });

    const results = await Promise.all(devicePromises);

    results.forEach(result => {
      activeCount += result.sessionCount;
      totalRx += result.bandwidth.rx;
      totalTx += result.bandwidth.tx;
    });

    // 3. Calculate Offline
    // Note: This is a rough estimate. Ideally we match usernames.
    // But for a quick dashboard stat, (Total - Active) is acceptable if DB is in sync.
    const offlineCount = Math.max(0, totalClients - activeCount);

    // Format Bandwidth
    const formatBits = (bits) => {
      if (bits >= 1000000000) return (bits / 1000000000).toFixed(1) + ' Gbps';
      return (bits / 1000000).toFixed(1) + ' Mbps';
    };

    const bandwidthString = `↓ ${formatBits(totalRx)}  ↑ ${formatBits(totalTx)}`;

    res.status(200).json({
      success: true,
      data: {
        total_clients: totalClients,
        active_sessions: activeCount,
        offline_clients: offlineCount,
        bandwidth_usage: bandwidthString
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

/**
 * Get all clients

 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
exports.getAllClients = async (req, res) => {
  try {
    const clients = await PPPoEClientModel.getAll();
    res.status(200).json({
      success: true,
      data: clients
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};

/**
 * Get client by ID
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
exports.getClientById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const client = await PPPoEClientModel.getById(id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.status(200).json({
      success: true,
      data: client
    });
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};

/**
 * Create new client
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
exports.createClient = async (req, res) => {
  try {
    const result = await addClientInternal(req.body);
    res.status(201).json({
      success: true,
      message: 'Client created successfully in Database and MikroTik',
      data: result
    });
  } catch (error) {
    console.error('Error creating client:', error);
    // Handle MikroTik specific errors
    if (error.message && error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        message: 'User already exists in MikroTik'
      });
    }
    res.status(500).json({
      success: false,
      message: `Failed to create client: ${error.message}`
    });
  }
};

/**
 * Update client
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
exports.updateClient = async (req, res) => {
  let mikrotikClient;
  try {
    const id = parseInt(req.params.id);
    const { customer_id, username, full_name, password, service_name, ip_address, mac_address, address, phone_number, latitude, longitude, device_id, odp_id } = req.body;

    // Check if client exists in DB
    const existingClient = await PPPoEClientModel.getById(id);
    if (!existingClient) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Update in MikroTik (using the device where the client currently resides)
    // If device_id is changing, this logic might need to be more complex (delete from old, add to new),
    // but for now we assume we are updating the config on the current device.
    const targetDeviceId = existingClient.device_id;

    if (targetDeviceId) {
      try {
        mikrotikClient = await getClientForDevice(targetDeviceId);

        // MikroTik update with timeout (10s)
        const secrets = await Promise.race([
          mikrotikClient.write(['/ppp/secret/print', `?name=${existingClient.username}`]),
          new Promise((_, reject) => setTimeout(() => reject(new Error('MikroTik request timeout')), 10000))
        ]);

        if (secrets.length === 0) {
          console.warn(`Client ${existingClient.username} not found in MikroTik during update.`);
        } else {
          const secretId = secrets[0]['.id'];
          const updateData = ['/ppp/secret/set', `=.id=${secretId}`];

          if (username) updateData.push(`=name=${username}`);
          if (password) updateData.push(`=password=${password}`);
          if (service_name) updateData.push(`=service=${service_name}`);
          if (ip_address !== undefined) updateData.push(`=remote-address=${ip_address}`);
          if (mac_address !== undefined) updateData.push(`=caller-id=${mac_address}`);

          await Promise.race([
            mikrotikClient.write(updateData),
            new Promise((_, reject) => setTimeout(() => reject(new Error('MikroTik update timeout')), 10000))
          ]);
        }
      } catch (mtError) {
        console.error('Failed to update MikroTik:', mtError);
        req.mikrotikError = mtError.message || mtError.toString();
        // Continue to DB update, but mark error
      }
    }

    const affectedRows = await PPPoEClientModel.update(id, {
      customer_id: customer_id || existingClient.customer_id,
      username: username || existingClient.username,
      full_name: full_name || existingClient.full_name,
      password: password || existingClient.password,
      service_name: service_name || existingClient.service_name,
      ip_address: ip_address !== undefined ? ip_address : existingClient.ip_address,
      mac_address: mac_address !== undefined ? mac_address : existingClient.mac_address,
      address: address !== undefined ? address : existingClient.address,
      phone_number: phone_number !== undefined ? phone_number : existingClient.phone_number,
      latitude: latitude !== undefined ? latitude : existingClient.latitude,
      longitude: longitude !== undefined ? longitude : existingClient.longitude,
      device_id: device_id || existingClient.device_id,
      odp_id: odp_id !== undefined ? odp_id : existingClient.odp_id // <-- fix ODP update
    });

    if (affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: 'No changes made or update failed'
      });
    }

    res.status(200).json({
      success: true,
      message: req.mikrotikError
        ? `Client updated in Database, but MikroTik error: ${req.mikrotikError}`
        : 'Client updated successfully in Database and MikroTik',
      mikrotikError: req.mikrotikError || null
    });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({
      success: false,
      message: `Failed to update client: ${error.message}`
    });
  } finally {
    if (mikrotikClient) mikrotikClient.close();
  }
};

/**
 * Delete client
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
exports.deleteClient = async (req, res) => {
  let mikrotikClient;
  try {
    const id = parseInt(req.params.id);
    const { sync_mikrotik } = req.query; // Read from query params
    const shouldSync = sync_mikrotik !== 'false'; // Default to true

    // Check if client exists
    const existingClient = await PPPoEClientModel.getById(id);
    if (!existingClient) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Delete from MikroTik
    if (shouldSync && existingClient.device_id) {
      try {
        mikrotikClient = await getClientForDevice(existingClient.device_id);
        const secrets = await mikrotikClient.write(['/ppp/secret/print', `?name=${existingClient.username}`]);

        if (secrets.length > 0) {
          const secretId = secrets[0]['.id'];
          await mikrotikClient.write(['/ppp/secret/remove', `=.id=${secretId}`]);
        }
      } catch (mtError) {
        console.error('Failed to delete from MikroTik:', mtError);
        // Proceed to delete from DB anyway? Yes.
      }
    }

    await PPPoEClientModel.delete(id);

    res.status(200).json({
      success: true,
      message: shouldSync ? 'Client deleted successfully from Database and MikroTik' : 'Client deleted successfully from Database only'
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({
      success: false,
      message: `Failed to delete client: ${error.message}`
    });
  } finally {
    if (mikrotikClient) mikrotikClient.close();
  }
};

/**
 * Download client import template
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
exports.downloadTemplate = (req, res) => {
  const headers = [
    'username', 'password', 'full_name', 'service_name',
    'ip_address', 'mac_address', 'address', 'phone_number',
    'latitude', 'longitude', 'device_name'
  ];
  // Example data
  const data = [
    {
      username: 'user1', password: 'password1', full_name: 'User One', service_name: 'pppoe',
      ip_address: '192.168.1.10', mac_address: 'AA:BB:CC:DD:EE:FF', address: 'Jl. Test No. 1',
      phone_number: '08123456789', latitude: '-6.200000', longitude: '106.816666', device_name: 'RB2011'
    }
  ];

  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.json_to_sheet(data, { header: headers });
  xlsx.utils.book_append_sheet(wb, ws, 'Clients');

  const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Disposition', 'attachment; filename="clients_template.xlsx"');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buffer);
};

/**
 * Import clients from Excel
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
exports.importClients = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  try {
    const wb = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(ws);

    const devices = await DeviceModel.getAll();
    const deviceMap = new Map(devices.map(d => [d.name, d.id]));

    const results = { success: 0, failed: 0, errors: [] };

    for (const row of data) {
      try {
        // Find device ID
        let deviceId = row.device_id;
        if (!deviceId && row.device_name) {
          deviceId = deviceMap.get(row.device_name);
        }

        if (!deviceId) {
          throw new Error(`Device '${row.device_name}' not found`);
        }

        await addClientInternal({
          ...row,
          device_id: deviceId
        });
        results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push({ username: row.username, error: err.message });
      }
    }

    res.json({ success: true, message: 'Import completed', results });

  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ success: false, message: 'Import failed', error: error.message });
  }
};

/**
 * Bulk delete clients
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
exports.bulkDelete = async (req, res) => {
  const { ids, sync_mikrotik = true } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: 'No IDs provided' });
  }

  try {
    // 1. Fetch clients to know their devices and usernames
    const clients = [];
    for (const id of ids) {
      const client = await PPPoEClientModel.getById(id);
      if (client) clients.push(client);
    }

    // 2. Delete from MikroTik if needed
    if (sync_mikrotik) {
      const deviceClientMap = new Map();

      for (const client of clients) {
        if (!client.device_id) continue;

        if (!deviceClientMap.has(client.device_id)) {
          const mkClient = await getMikrotikClient({
            host: client.device_ip,
            port: client.device_port,
            user: client.device_username,
            password: client.device_password
          });
          deviceClientMap.set(client.device_id, mkClient);
        }
      }

      for (const client of clients) {
        const mkClient = deviceClientMap.get(client.device_id);
        if (!mkClient) continue;

        try {
          const secrets = await mkClient.write(['/ppp/secret/print', `?name=${client.username}`]);
          if (secrets.length > 0) {
            const secretId = secrets[0]['.id'];
            await mkClient.write(['/ppp/secret/remove', `=.id=${secretId}`]);
          }
        } catch (mtError) {
          console.error(`Failed to delete client ${client.username} from MikroTik:`, mtError);
        }
      }

      // Close all MikroTik clients
      for (const mkClient of deviceClientMap.values()) {
        mkClient.close();
      }
    }

    // 3. Delete from Database
    for (const client of clients) {
      await PPPoEClientModel.delete(client.id);
    }

    res.json({ success: true, message: 'Bulk delete completed', deleted_count: clients.length });

  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({ success: false, message: 'Bulk delete failed', error: error.message });
  }
};