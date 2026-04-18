const express = require('express');
const router = express.Router();
const EquipmentTypeController = require('../controllers/equipmentTypeController');

router.post('/', EquipmentTypeController.create);
router.get('/', EquipmentTypeController.getAll);
router.get('/:id', EquipmentTypeController.getById);
router.put('/:id', EquipmentTypeController.update);
router.delete('/:id', EquipmentTypeController.delete);

module.exports = router;