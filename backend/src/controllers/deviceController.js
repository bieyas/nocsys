const DeviceModel = require('../models/deviceModel');

exports.getAllDevices = async (req, res) => {
    try {
        const devices = await DeviceModel.getAll();
        res.json({ success: true, data: devices });
    } catch (error) {
        console.error('Error fetching devices:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getDeviceById = async (req, res) => {
    try {
        const device = await DeviceModel.getById(req.params.id);
        if (!device) {
            return res.status(404).json({ success: false, message: 'Device not found' });
        }
        res.json({ success: true, data: device });
    } catch (error) {
        console.error('Error fetching device:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.createDevice = async (req, res) => {
    try {
        const { name, ip_address, username, password, type } = req.body;
        if (!name || !ip_address || !username || !password || !type) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }
        
        const id = await DeviceModel.create(req.body);
        res.status(201).json({ success: true, message: 'Device created', data: { id, ...req.body } });
    } catch (error) {
        console.error('Error creating device:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateDevice = async (req, res) => {
    try {
        const affected = await DeviceModel.update(req.params.id, req.body);
        if (affected === 0) {
            return res.status(404).json({ success: false, message: 'Device not found or no changes' });
        }
        res.json({ success: true, message: 'Device updated' });
    } catch (error) {
        console.error('Error updating device:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteDevice = async (req, res) => {
    try {
        const affected = await DeviceModel.delete(req.params.id);
        if (affected === 0) {
            return res.status(404).json({ success: false, message: 'Device not found' });
        }
        res.json({ success: true, message: 'Device deleted' });
    } catch (error) {
        console.error('Error deleting device:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
