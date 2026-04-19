const express = require('express');
const router = express.Router();
const VisitController = require('../controllers/visitController');

router.post('/', VisitController.create);
router.get('/', VisitController.getAll);

// Rota específica para buscar as visitas atreladas a uma manutenção
router.get('/maintenance/:maintenanceId', VisitController.getByMaintenance);

router.get('/:id', VisitController.getById);
router.put('/:id', VisitController.update);
router.delete('/:id', VisitController.delete);

module.exports = router;