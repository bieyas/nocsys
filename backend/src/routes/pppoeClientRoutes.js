
const express = require('express');
const router = express.Router();
const pppoeClientController = require('../controllers/pppoeClientController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @route PUT /api/pppoe-clients/:id/package
 * @desc Update package (subscription) for a client
 * @access Public
 */
router.put('/:id/package', pppoeClientController.updateClientPackage);

/**
 * @route POST /api/pppoe-clients/sync-status
 * @desc Sync client status (online/offline/isolir) from MikroTik to DB
 * @access Public
 */
router.post('/sync-status', async (req, res) => {
    const { device_id } = req.body;
    if (!device_id) {
        return res.status(400).json({ success: false, message: 'device_id wajib diisi' });
    }
    try {
        const { syncClientStatus } = require('../controllers/pppoeClientController');
        const result = await syncClientStatus(device_id);
        res.json({ success: true, message: 'Sinkronisasi status selesai', result });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Gagal sinkronisasi status', error: err.message });
    }
});

/**
 * @route GET /api/pppoe-clients/template
 * @desc Download client import template
 * @access Public
 */
router.get('/template', pppoeClientController.downloadTemplate);

/**
 * @route POST /api/pppoe-clients/import
 * @desc Import clients from Excel
 * @access Public
 */
router.post('/import', upload.single('file'), pppoeClientController.importClients);

/**
 * @route POST /api/pppoe-clients/bulk-delete
 * @desc Bulk delete clients
 * @access Public
 */
router.post('/bulk-delete', pppoeClientController.bulkDelete);

/**
 * @route POST /api/pppoe-clients/toggle-status
 * @desc Bulk toggle status (enable/disable)
 * @access Public
 */
router.post('/toggle-status', pppoeClientController.toggleStatus);

/**
 * @route GET /api/pppoe-clients
 * @desc Get all PPPoE clients
 * @access Public
 */
router.get('/', pppoeClientController.getAllClients);

/**
 * @route GET /api/pppoe-clients/stats
 * @desc Get dashboard statistics
 * @access Public
 */
router.get('/stats', pppoeClientController.getDashboardStats);

/**
 * @route GET /api/pppoe-clients/online
 * @desc Get list of online usernames
 * @access Public
 */
router.get('/online', pppoeClientController.getOnlineUsernames);

/**
 * @route GET /api/pppoe-clients/:id
 * @desc Get PPPoE client by ID
 * @access Public
 */
router.get('/:id', pppoeClientController.getClientById);

/**
 * @route POST /api/pppoe-clients
 * @desc Create a new PPPoE client
 * @access Public
 */
router.post('/', pppoeClientController.createClient);

/**
 * @route PUT /api/pppoe-clients/:id
 * @desc Update a PPPoE client
 * @access Public
 */
router.put('/:id', pppoeClientController.updateClient);

/**
 * @route DELETE /api/pppoe-clients/:id
 * @desc Delete a PPPoE client
 * @access Public
 */
router.delete('/:id', pppoeClientController.deleteClient);

/**
 * @route POST /api/pppoe-clients/sync
 * @desc Sync clients from MikroTik to Database
 * @access Public
 */
router.post('/sync', pppoeClientController.syncClients);

module.exports = router;
