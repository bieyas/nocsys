const express = require('express');
const router = express.Router();
const infrastructureController = require('../controllers/infrastructureController');

// POP Routes
router.get('/pops', infrastructureController.getAllPops);
router.post('/pops', infrastructureController.createPop);
router.put('/pops/:id', infrastructureController.updatePop);
router.delete('/pops/:id', infrastructureController.deletePop);

// ODP Routes
router.get('/odps', infrastructureController.getAllOdps);
router.post('/odps', infrastructureController.createOdp);
router.put('/odps/:id', infrastructureController.updateOdp);
router.delete('/odps/:id', infrastructureController.deleteOdp);

// Map Data Route
router.get('/map', infrastructureController.getMapData);

module.exports = router;
