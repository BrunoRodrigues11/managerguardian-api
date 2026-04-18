const db = require('../config/db'); 

class CompanyService {
  async createCompany(data) {
    const { name, document, email, phone } = data;
    const query = `
      INSERT INTO companies (name, document, email, phone) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *;
    `;
    const values = [name, document, email, phone];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  async getAllCompanies() {
    const query = 'SELECT * FROM companies WHERE active = true ORDER BY created_at DESC;';
    const result = await db.query(query);
    return result.rows;
  }

  async getCompanyById(id) {
    const query = 'SELECT * FROM companies WHERE id = $1 AND active = true;';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  async updateCompany(id, data) {
    const { name, document, email, phone, active } = data;
    const query = `
      UPDATE companies 
      SET name = $1, document = $2, email = $3, phone = $4, active = $5 
      WHERE id = $6 
      RETURNING *;
    `;
    const values = [name, document, email, phone, active, id];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  async deleteCompany(id) {
    // Soft delete (recomendado dado o seu campo 'active')
    const query = 'UPDATE companies SET active = false WHERE id = $1 RETURNING *;';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = new CompanyService();