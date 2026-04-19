const db = require('../config/db');

class VisitLogService {
  async createLog(data) {
    const { visit_id, message, user_name } = data;
    const query = `
      INSERT INTO visit_logs (visit_id, message, user_name) 
      VALUES ($1, $2, $3) 
      RETURNING *;
    `;
    const result = await db.query(query, [visit_id, message, user_name]);
    return result.rows[0];
  }

  // Busca todos os logs de uma visita específica (ordenados do mais antigo para o mais novo)
  async getLogsByVisitId(visitId) {
    const query = `
      SELECT * FROM visit_logs 
      WHERE visit_id = $1 
      ORDER BY date ASC;
    `;
    const result = await db.query(query, [visitId]);
    return result.rows;
  }
  
  // (Opcional) Busca um log específico por ID, caso seja necessário detalhar algo
  async getLogById(id) {
    const query = 'SELECT * FROM visit_logs WHERE id = $1;';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = new VisitLogService();