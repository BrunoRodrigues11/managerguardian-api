const db = require('../config/db');

class MaintenanceService {
_sanitizeData(data) {
    const payload = {};
    for (const [key, value] of Object.entries(data)) {
      if (key === 'id') continue;
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      
      // O SEGREDO ESTÁ AQUI: Transformar strings vazias em NULL
      if (value === '') {
        payload[snakeKey] = null;
      } else {
        payload[snakeKey] = value;
      }
    }
    return payload;
  }

  async createMaintenance(data) {
    const payload = this._sanitizeData(data);
    const fields = Object.keys(payload);
    const values = Object.values(payload);
    
    console.log('Payload sanitizado:', payload); // Debug: Verificar o payload antes de inserir
    if (fields.length === 0) throw new Error('Dados inválidos.');

    const placeholders = fields.map((_, index) => `$${index + 1}`).join(', ');
    const query = `INSERT INTO maintenances (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *;`;
    console.log('Query SQL:', query); // Debug: Verificar a query SQL gerada
    console.log('Values:', values); // Debug: Verificar os valores que serão inseridos

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
    const payload = this._sanitizeData(data);
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