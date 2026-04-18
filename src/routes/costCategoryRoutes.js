const express = require('express');
const router = express.Router();
const CostCategoryController = require('../controllers/costCategoryController');

router.post('/', CostCategoryController.create);
router.get('/', CostCategoryController.getAll);
router.get('/:id', CostCategoryController.getById);
router.put('/:id', CostCategoryController.update);
router.delete('/:id', CostCategoryController.delete);

module.exports = router;