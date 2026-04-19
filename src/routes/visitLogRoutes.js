const express = require('express');
const router = express.Router();
const VisitLogController = require('../controllers/visitLogController');

// Cria um novo log
router.post('/', VisitLogController.create);

// Busca todos os logs de uma visita específica
router.get('/visit/:visitId', VisitLogController.getByVisit);

// Busca um log específico pelo ID dele
router.get('/:id', VisitLogController.getById);

module.exports = router;