const EquipmentTypeService = require('../services/equipmentTypeService');

class EquipmentTypeController {
  async create(req, res) {
    try {
      const type = await EquipmentTypeService.createType(req.body);
      return res.status(201).json(type);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao criar tipo de equipamento', details: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const types = await EquipmentTypeService.getAllTypes();
      return res.status(200).json(types);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar tipos de equipamento' });
    }
  }

  async getById(req, res) {
    try {
      const type = await EquipmentTypeService.getTypeById(req.params.id);
      if (!type) {
        return res.status(404).json({ error: 'Tipo de equipamento não encontrado' });
      }
      return res.status(200).json(type);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar tipo de equipamento' });
    }
  }

  async update(req, res) {
    try {
      const type = await EquipmentTypeService.updateType(req.params.id, req.body);
      if (!type) {
        return res.status(404).json({ error: 'Tipo de equipamento não encontrado' });
      }
      return res.status(200).json(type);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar tipo de equipamento' });
    }
  }

  async delete(req, res) {
    try {
      const type = await EquipmentTypeService.deleteType(req.params.id);
      return res.status(200).json({ message: 'Tipo de equipamento desativado com sucesso', type });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao desativar tipo de equipamento' });
    }
  }
}

module.exports = new EquipmentTypeController();