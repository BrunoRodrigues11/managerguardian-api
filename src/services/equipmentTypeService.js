const db = require('../config/db');

class EquipmentTypeService {
  async createType(data) {
    const { name } = data;
    const query = `
      INSERT INTO equipment_types (name) 
      VALUES ($1) 
      RETURNING *;
    `;
    const result = await db.query(query, [name]);
    return result.rows[0];
  }

  async getAllTypes() {
    const query = 'SELECT * FROM equipment_types WHERE active = true ORDER BY name ASC;';
    const result = await db.query(query);
    return result.rows;
  }

  async getTypeById(id) {
    const query = 'SELECT * FROM equipment_types WHERE id = $1 AND active = true;';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  async updateType(id, data) {
    const { name, active } = data;
    const query = `
      UPDATE equipment_types 
      SET name = $1, active = $2 
      WHERE id = $3 
      RETURNING *;
    `;
    const result = await db.query(query, [name, active, id]);
    return result.rows[0];
  }

  async deleteType(id) {
    // Soft delete para manter o histórico de manutenções vinculadas
    const query = 'UPDATE equipment_types SET active = false WHERE id = $1 RETURNING *;';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = new EquipmentTypeService();