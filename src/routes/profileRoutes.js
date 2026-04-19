const express = require('express');
const router = express.Router();
const ProfileController = require('../controllers/profileController');

router.post('/', ProfileController.create);
router.get('/', ProfileController.getAll);
router.get('/:id', ProfileController.getById);
router.put('/:id', ProfileController.update);
router.delete('/:id', ProfileController.delete);

module.exports = router;