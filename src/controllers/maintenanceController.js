const MaintenanceService = require('../services/maintenanceService');

class MaintenanceController {
  async create(req, res) {
    try {
      const maintenance = await MaintenanceService.createMaintenance(req.body);
      return res.status(201).json(maintenance);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao registrar manutenção', details: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const maintenances = await MaintenanceService.getAllMaintenances();
      return res.status(200).json(maintenances);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar manutenções' });
    }
  }

  async getById(req, res) {
    try {
      const maintenance = await MaintenanceService.getMaintenanceById(req.params.id);
      if (!maintenance) return res.status(404).json({ error: 'Manutenção não encontrada' });
      return res.status(200).json(maintenance);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar manutenção' });
    }
  }

  async update(req, res) {
    try {
      const maintenance = await MaintenanceService.updateMaintenance(req.params.id, req.body);
      return res.status(200).json(maintenance);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar manutenção' });
    }
  }
}

module.exports = new MaintenanceController();