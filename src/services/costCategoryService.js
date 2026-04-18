const db = require('../config/db');

class CostCategoryService {
  async createCategory(data) {
    const { name } = data;
    const query = `
      INSERT INTO cost_categories (name) 
      VALUES ($1) 
      RETURNING *;
    `;
    const result = await db.query(query, [name]);
    return result.rows[0];
  }

  async getAllCategories() {
    const query = 'SELECT * FROM cost_categories WHERE active = true ORDER BY name ASC;';
    const result = await db.query(query);
    return result.rows;
  }

  async getCategoryById(id) {
    const query = 'SELECT * FROM cost_categories WHERE id = $1 AND active = true;';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  async updateCategory(id, data) {
    const { name, active } = data;
    const query = `
      UPDATE cost_categories 
      SET name = $1, active = $2 
      WHERE id = $3 
      RETURNING *;
    `;
    const result = await db.query(query, [name, active, id]);
    return result.rows[0];
  }

  async deleteCategory(id) {
    // Soft delete para não quebrar o histórico financeiro das manutenções
    const query = 'UPDATE cost_categories SET active = false WHERE id = $1 RETURNING *;';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = new CostCategoryService();