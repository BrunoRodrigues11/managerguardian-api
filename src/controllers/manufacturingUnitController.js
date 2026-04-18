const ManufacturingUnitService = require('../services/manufacturingUnitService');

class ManufacturingUnitController {
  async create(req, res) {
    try {
      const unit = await ManufacturingUnitService.createUnit(req.body);
      return res.status(201).json(unit);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao criar unidade fabril', details: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const units = await ManufacturingUnitService.getAllUnits();
      return res.status(200).json(units);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar unidades fabris' });
    }
  }

  async getById(req, res) {
    try {
      const unit = await ManufacturingUnitService.getUnitById(req.params.id);
      if (!unit) {
        return res.status(404).json({ error: 'Unidade fabril não encontrada' });
      }
      return res.status(200).json(unit);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar unidade fabril' });
    }
  }

  async update(req, res) {
    try {
      const unit = await ManufacturingUnitService.updateUnit(req.params.id, req.body);
      if (!unit) {
        return res.status(404).json({ error: 'Unidade fabril não encontrada' });
      }
      return res.status(200).json(unit);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar unidade fabril' });
    }
  }

  async delete(req, res) {
    try {
      const unit = await ManufacturingUnitService.deleteUnit(req.params.id);
      return res.status(200).json({ message: 'Unidade fabril desativada com sucesso', unit });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao desativar unidade fabril' });
    }
  }
}

module.exports = new ManufacturingUnitController();