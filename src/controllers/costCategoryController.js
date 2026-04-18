const CostCategoryService = require('../services/costCategoryService');

class CostCategoryController {
  async create(req, res) {
    try {
      const category = await CostCategoryService.createCategory(req.body);
      return res.status(201).json(category);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao criar categoria de custo', details: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const categories = await CostCategoryService.getAllCategories();
      return res.status(200).json(categories);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar categorias de custo' });
    }
  }

  async getById(req, res) {
    try {
      const category = await CostCategoryService.getCategoryById(req.params.id);
      if (!category) {
        return res.status(404).json({ error: 'Categoria de custo não encontrada' });
      }
      return res.status(200).json(category);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar categoria de custo' });
    }
  }

  async update(req, res) {
    try {
      const category = await CostCategoryService.updateCategory(req.params.id, req.body);
      if (!category) {
        return res.status(404).json({ error: 'Categoria de custo não encontrada' });
      }
      return res.status(200).json(category);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar categoria de custo' });
    }
  }

  async delete(req, res) {
    try {
      const category = await CostCategoryService.deleteCategory(req.params.id);
      return res.status(200).json({ message: 'Categoria de custo desativada com sucesso', category });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao desativar categoria de custo' });
    }
  }
}

module.exports = new CostCategoryController();