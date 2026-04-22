const db = require('../config/db');

class VisitService {
  _sanitizeData(data) {
    const payload = {};
    for (const [key, value] of Object.entries(data)) {
      if (key === 'id') continue;
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      
      // O banco armazena o JSONB diretamente
      if (snakeKey === 'logs' && typeof value !== 'string') {
        payload[snakeKey] = JSON.stringify(value);
      } else {
        payload[snakeKey] = value;
      }
    }
    return payload;
  }

  async createVisit(data) {
    const payload = this._sanitizeData(data);
    const fields = Object.keys(payload);
    const values = Object.values(payload);
    if (fields.length === 0) throw new Error('Dados inválidos.');

    const placeholders = fields.map((_, index) => `$${index + 1}`).join(', ');
    const query = `INSERT INTO visits (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *;`;
    const result = await db.query(query, values);
    return result.rows[0];
  }

  async getAllVisits() {
    const query = 'SELECT * FROM visits ORDER BY date DESC;';
    const result = await db.query(query);
    return result.rows;
  }

  async getVisitById(id) {
    const query = 'SELECT * FROM visits WHERE id = $1;';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  async updateVisit(id, data) {
    const payload = this._sanitizeData(data);
    const fields = Object.keys(payload);
    const values = Object.values(payload);
    if (fields.length === 0) throw new Error('Dados inválidos.');

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const query = `UPDATE visits SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *;`;
    const result = await db.query(query, [...values, id]);
    return result.rows[0];
  }

  async deleteVisit(id) {
    const query = 'UPDATE visits SET status = \'Cancelada\' WHERE id = $1 RETURNING *;';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = new VisitService();