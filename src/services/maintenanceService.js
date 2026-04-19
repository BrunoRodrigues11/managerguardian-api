const db = require('../config/db');

class MaintenanceService {
  async createMaintenance(data) {
    const {
      ticket_number, vendor_ticket_number, date, type, status,
      unit_id, company_id, equipment_type_id, brand, model,
      serial_number, asset_tag, issue_summary, shipment_date,
      return_date, closure_notes
    } = data;

    const query = `
      INSERT INTO maintenances (
        ticket_number, vendor_ticket_number, date, type, status,
        unit_id, company_id, equipment_type_id, brand, model,
        serial_number, asset_tag, issue_summary, shipment_date,
        return_date, closure_notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) 
      RETURNING *;
    `;

    const values = [
      ticket_number, vendor_ticket_number, date, type, status,
      unit_id, company_id, equipment_type_id, brand, model,
      serial_number, asset_tag, issue_summary, shipment_date,
      return_date, closure_notes
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  async getAllMaintenances() {
    const query = `
      SELECT 
        m.*, 
        u.name AS unit_name, 
        c.name AS company_name, 
        et.name AS equipment_type_name
      FROM maintenances m
      LEFT JOIN manufacturing_units u ON m.unit_id = u.id
      LEFT JOIN companies c ON m.company_id = c.id
      LEFT JOIN equipment_types et ON m.equipment_type_id = et.id
      ORDER BY m.date DESC, m.created_at DESC;
    `;
    const result = await db.query(query);
    return result.rows;
  }

  async getMaintenanceById(id) {
    const query = `
      SELECT 
        m.*, 
        u.name AS unit_name, 
        c.name AS company_name, 
        et.name AS equipment_type_name
      FROM maintenances m
      LEFT JOIN manufacturing_units u ON m.unit_id = u.id
      LEFT JOIN companies c ON m.company_id = c.id
      LEFT JOIN equipment_types et ON m.equipment_type_id = et.id
      WHERE m.id = $1;
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  async updateMaintenance(id, data) {
    const fields = Object.keys(data);
    const values = Object.values(data);
    
    // Construção de query dinâmica para facilitar updates parciais
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const query = `UPDATE maintenances SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *;`;
    
    const result = await db.query(query, [...values, id]);
    return result.rows[0];
  }
}

module.exports = new MaintenanceService();