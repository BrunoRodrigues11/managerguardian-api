const db = require('../config/db');
const { sanitizeData } = require('../utils/dataSanitizer');

class MaintenanceCostService {
  async createCost(data) {
    const sanitizedData = sanitizeData(data);
    const { maintenance_id, category_id, description, quantity = 1, unit_value } = sanitizedData;
    const query = `
      INSERT INTO maintenance_costs (maintenance_id, category_id, description, quantity, unit_value) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *;
    `;
    
    const result = await db.query(query, [maintenance_id, category_id, description, quantity, unit_value]);
    return result.rows[0];
  }

  async getAllCosts() {
    const query = `
      SELECT mc.*, cc.name AS category_name 
      FROM maintenance_costs mc
      LEFT JOIN cost_categories cc ON mc.category_id = cc.id
      ORDER BY mc.created_at DESC;
    `;
    const result = await db.query(query);
    return result.rows;
  }

  async getCostById(id) {
    const query = `
      SELECT mc.*, cc.name AS category_name 
      FROM maintenance_costs mc
      LEFT JOIN cost_categories cc ON mc.category_id = cc.id
      WHERE mc.id = $1;
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  // Método bônus e muito útil para a tela de Detalhes da Manutenção
  async getCostsByMaintenanceId(maintenanceId) {
    const query = `
      SELECT mc.*, cc.name AS category_name 
      FROM maintenance_costs mc
      LEFT JOIN cost_categories cc ON mc.category_id = cc.id
      WHERE mc.maintenance_id = $1
      ORDER BY mc.created_at DESC;
    `;
    const result = await db.query(query, [maintenanceId]);
    return result.rows;
  }

  async updateCost(id, data) {
    const { category_id, description, quantity, unit_value } = data;
    const query = `
      UPDATE maintenance_costs 
      SET category_id = $1, description = $2, quantity = $3, unit_value = $4 
      WHERE id = $5 
      RETURNING *;
    `;
    const result = await db.query(query, [category_id, description, quantity, unit_value, id]);
    return result.rows[0];
  }

  async deleteCost(id) {
    // Hard delete (exclusão definitiva)
    const query = 'DELETE FROM maintenance_costs WHERE id = $1 RETURNING *;';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = new MaintenanceCostService();