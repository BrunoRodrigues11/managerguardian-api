const db = require('../config/db');

class TechnicianService {
  async createTechnician(data) {
    const { name, company_id } = data;
    const query = `
      INSERT INTO technicians (name, company_id) 
      VALUES ($1, $2) 
      RETURNING *;
    `;
    const result = await db.query(query, [name, company_id]);
    return result.rows[0];
  }

  async getAllTechnicians() {
    // Trazendo os dados do técnico e o nome da empresa vinculada
    const query = `
      SELECT t.*, c.name AS company_name 
      FROM technicians t
      LEFT JOIN companies c ON t.company_id = c.id
      WHERE t.active = true 
      ORDER BY t.name ASC;
    `;
    const result = await db.query(query);
    return result.rows;
  }

  async getTechnicianById(id) {
    const query = `
      SELECT t.*, c.name AS company_name 
      FROM technicians t
      LEFT JOIN companies c ON t.company_id = c.id
      WHERE t.id = $1 AND t.active = true;
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  async updateTechnician(id, data) {
    const { name, company_id, active } = data;
    const query = `
      UPDATE technicians 
      SET name = $1, company_id = $2, active = $3 
      WHERE id = $4 
      RETURNING *;
    `;
    const result = await db.query(query, [name, company_id, active, id]);
    return result.rows[0];
  }

  async deleteTechnician(id) {
    const query = 'UPDATE technicians SET active = false WHERE id = $1 RETURNING *;';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = new TechnicianService();