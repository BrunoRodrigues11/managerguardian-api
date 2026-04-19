const VisitService = require('../services/visitService');

class VisitController {
  async create(req, res) {
    try {
      const visit = await VisitService.createVisit(req.body);
      return res.status(201).json(visit);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao agendar visita', details: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const visits = await VisitService.getAllVisits();
      return res.status(200).json(visits);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar visitas' });
    }
  }

  async getById(req, res) {
    try {
      const visit = await VisitService.getVisitById(req.params.id);
      if (!visit) {
        return res.status(404).json({ error: 'Visita não encontrada' });
      }
      return res.status(200).json(visit);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar visita' });
    }
  }

  async getByMaintenance(req, res) {
    try {
      const visits = await VisitService.getVisitsByMaintenanceId(req.params.maintenanceId);
      return res.status(200).json(visits);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar visitas da manutenção' });
    }
  }

  async update(req, res) {
    try {
      const visit = await VisitService.updateVisit(req.params.id, req.body);
      if (!visit) {
        return res.status(404).json({ error: 'Visita não encontrada' });
      }
      return res.status(200).json(visit);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar visita' });
    }
  }

  async delete(req, res) {
    try {
      const visit = await VisitService.deleteVisit(req.params.id);
      if (!visit) {
        return res.status(404).json({ error: 'Visita não encontrada' });
      }
      return res.status(200).json({ message: 'Visita excluída com sucesso', visit });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao excluir visita' });
    }
  }
}

module.exports = new VisitController();