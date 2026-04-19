const MaintenanceCostService = require('../services/maintenanceCostService');

class MaintenanceCostController {
  async create(req, res) {
    try {
      const cost = await MaintenanceCostService.createCost(req.body);
      return res.status(201).json(cost);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao registrar custo', details: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const costs = await MaintenanceCostService.getAllCosts();
      return res.status(200).json(costs);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar custos' });
    }
  }

  async getById(req, res) {
    try {
      const cost = await MaintenanceCostService.getCostById(req.params.id);
      if (!cost) {
        return res.status(404).json({ error: 'Custo não encontrado' });
      }
      return res.status(200).json(cost);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar custo' });
    }
  }

  async getByMaintenance(req, res) {
    try {
      const costs = await MaintenanceCostService.getCostsByMaintenanceId(req.params.maintenanceId);
      return res.status(200).json(costs);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar custos da manutenção' });
    }
  }

  async update(req, res) {
    try {
      const cost = await MaintenanceCostService.updateCost(req.params.id, req.body);
      if (!cost) {
        return res.status(404).json({ error: 'Custo não encontrado' });
      }
      return res.status(200).json(cost);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar custo' });
    }
  }

  async delete(req, res) {
    try {
      const cost = await MaintenanceCostService.deleteCost(req.params.id);
      if (!cost) {
        return res.status(404).json({ error: 'Custo não encontrado' });
      }
      return res.status(200).json({ message: 'Custo excluído com sucesso', cost });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao excluir custo' });
    }
  }
}

module.exports = new MaintenanceCostController();