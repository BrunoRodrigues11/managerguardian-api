const express = require('express');
const router = express.Router();
const MaintenanceController = require('../controllers/maintenanceController');

router.post('/', MaintenanceController.create);
router.get('/', MaintenanceController.getAll);
router.get('/:id', MaintenanceController.getById);
router.put('/:id', MaintenanceController.update);

module.exports = router;