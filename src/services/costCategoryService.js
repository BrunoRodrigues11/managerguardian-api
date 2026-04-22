const db = require('../config/db');

class CostCategoryService {
  _sanitizeData(data) {
    const payload = {};
    for (const [key, value] of Object.entries(data)) {
      if (key === 'id') continue;
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      payload[snakeKey] = value;
    }
    return payload;
  }

  async createCategory(data) {
    const payload = this._sanitizeData(data);
    const fields = Object.keys(payload);
    const values = Object.values(payload);
    if (fields.length === 0) throw new Error('Dados inválidos.');

    const placeholders = fields.map((_, index) => `$${index + 1}`).join(', ');
    const query = `INSERT INTO cost_categories (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *;`;
    const result = await db.query(query, values);
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
    const payload = this._sanitizeData(data);
    const fields = Object.keys(payload);
    const values = Object.values(payload);
    if (fields.length === 0) throw new Error('Dados inválidos.');

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const query = `UPDATE cost_categories SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *;`;
    const result = await db.query(query, [...values, id]);
    return result.rows[0];
  }

  async deleteCategory(id) {
    const query = 'UPDATE cost_categories SET active = false WHERE id = $1 RETURNING *;';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = new CostCategoryService();