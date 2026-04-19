const VisitLogService = require('../services/visitLogService');

class VisitLogController {
  async create(req, res) {
    try {
      const log = await VisitLogService.createLog(req.body);
      return res.status(201).json(log);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao registrar log da visita', details: error.message });
    }
  }

  async getByVisit(req, res) {
    try {
      const logs = await VisitLogService.getLogsByVisitId(req.params.visitId);
      return res.status(200).json(logs);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar logs da visita' });
    }
  }

  async getById(req, res) {
    try {
      const log = await VisitLogService.getLogById(req.params.id);
      if (!log) {
        return res.status(404).json({ error: 'Log não encontrado' });
      }
      return res.status(200).json(log);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar log' });
    }
  }
}

module.exports = new VisitLogController();