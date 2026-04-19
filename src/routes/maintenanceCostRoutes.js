const express = require('express');
const router = express.Router();
const MaintenanceCostController = require('../controllers/maintenanceCostController');

router.post('/', MaintenanceCostController.create);
router.get('/', MaintenanceCostController.getAll);

// Rota para buscar custos específicos de uma manutenção
router.get('/maintenance/:maintenanceId', MaintenanceCostController.getByMaintenance);

router.get('/:id', MaintenanceCostController.getById);
router.put('/:id', MaintenanceCostController.update);
router.delete('/:id', MaintenanceCostController.delete);

module.exports = router;