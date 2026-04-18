const express = require('express');
const router = express.Router();
const ManufacturingUnitController = require('../controllers/manufacturingUnitController');

router.post('/', ManufacturingUnitController.create);
router.get('/', ManufacturingUnitController.getAll);
router.get('/:id', ManufacturingUnitController.getById);
router.put('/:id', ManufacturingUnitController.update);
router.delete('/:id', ManufacturingUnitController.delete);

module.exports = router;