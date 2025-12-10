const syncPPPProfilesToPackages = require('../../scripts/syncPPPProfilesToPackages');
// Sinkronisasi profile PPP Mikrotik ke packages
exports.syncPPPProfiles = async (req, res) => {
    try {
        await syncPPPProfilesToPackages();
        res.json({ success: true, message: 'Sinkronisasi profile PPP Mikrotik ke paket berhasil.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Gagal sinkronisasi profile PPP', error: err.message });
    }
};
const PackageModel = require('../models/packageModel');

exports.getAll = async (req, res) => {
    try {
        const packages = await PackageModel.getAll();
        res.json({ success: true, data: packages });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const pkg = await PackageModel.getById(req.params.id);
        if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });
        res.json({ success: true, data: pkg });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const id = await PackageModel.create(req.body);
        res.status(201).json({ success: true, id });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const affected = await PackageModel.update(req.params.id, req.body);
        if (!affected) return res.status(404).json({ success: false, message: 'Package not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const affected = await PackageModel.delete(req.params.id);
        if (!affected) return res.status(404).json({ success: false, message: 'Package not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
