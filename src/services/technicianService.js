const db = require('../config/db');

class TechnicianService {
  _sanitizeData(data) {
    const payload = {};
    for (const [key, value] of Object.entries(data)) {
      if (key === 'id') continue;
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      payload[snakeKey] = value;
    }
    return payload;
  }

  async createTechnician(data) {
    const payload = this._sanitizeData(data);
    const fields = Object.keys(payload);
    const values = Object.values(payload);
    if (fields.length === 0) throw new Error('Dados inválidos.');

    const placeholders = fields.map((_, index) => `$${index + 1}`).join(', ');
    const query = `INSERT INTO technicians (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *;`;
    const result = await db.query(query, values);
    return result.rows[0];
  }

  async getAllTechnicians() {
    const query = 'SELECT * FROM technicians WHERE active = true ORDER BY name ASC;';
    const result = await db.query(query);
    return result.rows;
  }

  async getTechnicianById(id) {
    const query = 'SELECT * FROM technicians WHERE id = $1 AND active = true;';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  async updateTechnician(id, data) {
    const payload = this._sanitizeData(data);
    const fields = Object.keys(payload);
    const values = Object.values(payload);
    if (fields.length === 0) throw new Error('Dados inválidos.');

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const query = `UPDATE technicians SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *;`;
    const result = await db.query(query, [...values, id]);
    return result.rows[0];
  }

  async deleteTechnician(id) {
    const query = 'UPDATE technicians SET active = false WHERE id = $1 RETURNING *;';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = new TechnicianService();