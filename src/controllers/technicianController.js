const TechnicianService = require('../services/technicianService');

class TechnicianController {
  async create(req, res) {
    try {
      const technician = await TechnicianService.createTechnician(req.body);
      return res.status(201).json(technician);
    } catch (error) {
      // Se o company_id for inválido, o banco vai estourar um erro de Foreign Key
      return res.status(500).json({ error: 'Erro ao criar técnico', details: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const technicians = await TechnicianService.getAllTechnicians();
      return res.status(200).json(technicians);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar técnicos' });
    }
  }

  async getById(req, res) {
    try {
      const technician = await TechnicianService.getTechnicianById(req.params.id);
      if (!technician) {
        return res.status(404).json({ error: 'Técnico não encontrado' });
      }
      return res.status(200).json(technician);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar técnico' });
    }
  }

  async update(req, res) {
    try {
      const technician = await TechnicianService.updateTechnician(req.params.id, req.body);
      if (!technician) {
        return res.status(404).json({ error: 'Técnico não encontrado' });
      }
      return res.status(200).json(technician);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar técnico' });
    }
  }

  async delete(req, res) {
    try {
      const technician = await TechnicianService.deleteTechnician(req.params.id);
      return res.status(200).json({ message: 'Técnico desativado com sucesso', technician });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao desativar técnico' });
    }
  }
}

module.exports = new TechnicianController();