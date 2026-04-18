const express = require('express');
const router = express.Router();
const TechnicianController = require('../controllers/technicianController');

router.post('/', TechnicianController.create);
router.get('/', TechnicianController.getAll);
router.get('/:id', TechnicianController.getById);
router.put('/:id', TechnicianController.update);
router.delete('/:id', TechnicianController.delete);

module.exports = router;