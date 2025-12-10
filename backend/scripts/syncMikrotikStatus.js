require('dotenv').config({ path: __dirname + '/../.env' });
const { getMikrotikClient } = require('../src/config/mikrotik');
const PPPoEClientModel = require('../src/models/pppoeClientModel');
const DeviceModel = require('../src/models/deviceModel');

// Hybrid: Optionally broadcast status update to WebSocket if running as part of main app
let broadcastStatusUpdate;
try {
    ({ broadcastStatusUpdate } = require('../websocket/server'));
} catch (e) {
    // Ignore if not available (standalone script)
}

async function syncMikrotikStatus() {
    const { syncClientStatus } = require('../src/controllers/pppoeClientController');
    const devices = await DeviceModel.getAll();
    let allStatus = [];
    for (const device of devices) {
        if (!device.ip_address || !device.username || !device.password || !device.port) {
            console.log(`Lewati device ${device.name}: data tidak lengkap.`);
            continue;
        }
        try {
            const result = await syncClientStatus(device.id);
            // Ambil status terbaru dari DB untuk broadcast
            const clients = await PPPoEClientModel.getAll();
            const clientsForDevice = clients.filter(c => c.device_id === device.id);
            for (const c of clientsForDevice) {
                allStatus.push({ id: c.id, username: c.username, status: c.status });
            }
            console.log(`Sync selesai untuk device ${device.name}. Updated: ${result.updated}/${result.total}`);
        } catch (err) {
            console.error(`Sync error untuk device ${device.name}:`, err);
        }
    }
    if (broadcastStatusUpdate && allStatus.length > 0) {
        broadcastStatusUpdate(allStatus);
    }
    console.log('Sync multi-device completed.');
}

module.exports = syncMikrotikStatus;
