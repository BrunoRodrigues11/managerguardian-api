const db = require('../config/db');

class ManufacturingUnitService {
  async createUnit(data) {
    const { name, code, city, state, notes } = data;
    const query = `
      INSERT INTO manufacturing_units (name, code, city, state, notes) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *;
    `;
    const values = [name, code, city, state, notes];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  async getAllUnits() {
    const query = 'SELECT * FROM manufacturing_units WHERE active = true ORDER BY name ASC;';
    const result = await db.query(query);
    return result.rows;
  }

  async getUnitById(id) {
    const query = 'SELECT * FROM manufacturing_units WHERE id = $1 AND active = true;';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  async updateUnit(id, data) {
    const { name, code, city, state, active, notes } = data;
    const query = `
      UPDATE manufacturing_units 
      SET name = $1, code = $2, city = $3, state = $4, active = $5, notes = $6 
      WHERE id = $7 
      RETURNING *;
    `;
    const values = [name, code, city, state, active, notes, id];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  async deleteUnit(id) {
    // Soft delete (desativação)
    const query = 'UPDATE manufacturing_units SET active = false WHERE id = $1 RETURNING *;';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = new ManufacturingUnitService();