const db = require('../config/db');
const { sanitizeData } = require('../utils/dataSanitizer');

class MaintenanceService {
  async createMaintenance(data) {
    const payload = sanitizeData(data);
    const fields = Object.keys(payload);
    const values = Object.values(payload);
    
    if (fields.length === 0) throw new Error('Dados inválidos.');

    const placeholders = fields.map((_, index) => `$${index + 1}`).join(', ');
    const query = `INSERT INTO maintenances (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *;`;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  async getAllMaintenances() {
    const query = 'SELECT * FROM maintenances ORDER BY date DESC;';
    const result = await db.query(query);
    return result.rows;
  }

  async getMaintenanceById(id) {
    const query = 'SELECT * FROM maintenances WHERE id = $1;';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  async updateMaintenance(id, data) {
    const payload = _sanitizeData(data);
    const fields = Object.keys(payload);
    const values = Object.values(payload);
    
    if (fields.length === 0) throw new Error('Dados inválidos.');

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const query = `UPDATE maintenances SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *;`;
    
    const result = await db.query(query, [...values, id]);
    return result.rows[0];
  }

  async deleteMaintenance(id) {
    // Soft delete ou mudança de status para Cancelado
    const query = 'UPDATE maintenances SET status = $1 WHERE id = $2 RETURNING *;';
    const result = await db.query(query, ['Cancelada', id]);
    return result.rows[0];
  }
}

module.exports = new MaintenanceService();