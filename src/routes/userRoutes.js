const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');

// Criação e Login
router.post('/', UserController.create);
router.post('/login', UserController.login);

// CRUD de Gestão de Usuários
router.get('/', UserController.getAll);
router.get('/:id', UserController.getById);
router.put('/:id', UserController.update);
router.delete('/:id', UserController.delete);

module.exports = router;