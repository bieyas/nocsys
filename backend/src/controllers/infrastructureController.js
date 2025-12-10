const PopModel = require('../models/popModel');
const OdpModel = require('../models/odpModel');
const PPPoEClientModel = require('../models/pppoeClientModel');

// POP Controllers
exports.getAllPops = async (req, res) => {
    try {
        const pops = await PopModel.getAll();
        res.json({ success: true, data: pops });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createPop = async (req, res) => {
    try {
        const id = await PopModel.create(req.body);
        res.status(201).json({ success: true, message: 'POP created', data: { id, ...req.body } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updatePop = async (req, res) => {
    try {
        await PopModel.update(req.params.id, req.body);
        res.json({ success: true, message: 'POP updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deletePop = async (req, res) => {
    try {
        await PopModel.delete(req.params.id);
        res.json({ success: true, message: 'POP deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ODP Controllers
exports.getAllOdps = async (req, res) => {
    try {
        const odps = await OdpModel.getAll();
        res.json({ success: true, data: odps });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createOdp = async (req, res) => {
    try {
        const id = await OdpModel.create(req.body);
        res.status(201).json({ success: true, message: 'ODP created', data: { id, ...req.body } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateOdp = async (req, res) => {
    try {
        await OdpModel.update(req.params.id, req.body);
        res.json({ success: true, message: 'ODP updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteOdp = async (req, res) => {
    try {
        await OdpModel.delete(req.params.id);
        res.json({ success: true, message: 'ODP deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Map Data Controller
exports.getMapData = async (req, res) => {
    try {
        const [pops, odps, clients] = await Promise.all([
            PopModel.getAll(),
            OdpModel.getAll(),
            PPPoEClientModel.getAll()
        ]);

        // Filter items that have coordinates
        const validPops = pops.filter(p => p.latitude && p.longitude);
        const validOdps = odps.filter(o => o.latitude && o.longitude);
        const validClients = clients.filter(c => c.latitude && c.longitude);

        // Real-time ping for client status
        const { pingHost } = require('../utils/ping');
        const clientsWithStatus = await Promise.all(validClients.map(async (client) => {
            let status = 'offline';
            // Isolir jika IP 10.127.x.x
            if (client.ip_address && client.ip_address.startsWith('10.127.')) {
                status = 'isolir';
            } else if (client.ip_address) {
                const isOnline = await pingHost(client.ip_address);
                status = isOnline ? 'online' : 'offline';
            }
            return { ...client, status };
        }));

        res.json({
            success: true,
            data: {
                pops: validPops,
                odps: validOdps,
                clients: clientsWithStatus
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
