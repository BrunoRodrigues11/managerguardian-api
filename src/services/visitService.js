const db = require('../config/db');

class VisitService {
  async createVisit(data) {
    const {
      ticket_number, date, start_time, end_time, status, unit_id,
      technician_id, company_id, equipment_type_id, brand, model,
      serial_number, asset_tag, issue_summary, maintenance_id
    } = data;

    const query = `
      INSERT INTO visits (
        ticket_number, date, start_time, end_time, status, unit_id,
        technician_id, company_id, equipment_type_id, brand, model,
        serial_number, asset_tag, issue_summary, maintenance_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) 
      RETURNING *;
    `;

    const values = [
      ticket_number, date, start_time, end_time, status, unit_id,
      technician_id, company_id, equipment_type_id, brand, model,
      serial_number, asset_tag, issue_summary, maintenance_id
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  async getAllVisits() {
    const query = `
      SELECT 
        v.*, 
        u.name AS unit_name, 
        t.name AS technician_name,
        c.name AS company_name, 
        et.name AS equipment_type_name,
        m.ticket_number AS maintenance_ticket_number
      FROM visits v
      LEFT JOIN manufacturing_units u ON v.unit_id = u.id
      LEFT JOIN technicians t ON v.technician_id = t.id
      LEFT JOIN companies c ON v.company_id = c.id
      LEFT JOIN equipment_types et ON v.equipment_type_id = et.id
      LEFT JOIN maintenances m ON v.maintenance_id = m.id
      ORDER BY v.date DESC, v.start_time DESC;
    `;
    const result = await db.query(query);
    return result.rows;
  }

  async getVisitById(id) {
    const query = `
      SELECT 
        v.*, 
        u.name AS unit_name, 
        t.name AS technician_name,
        c.name AS company_name, 
        et.name AS equipment_type_name,
        m.ticket_number AS maintenance_ticket_number
      FROM visits v
      LEFT JOIN manufacturing_units u ON v.unit_id = u.id
      LEFT JOIN technicians t ON v.technician_id = t.id
      LEFT JOIN companies c ON v.company_id = c.id
      LEFT JOIN equipment_types et ON v.equipment_type_id = et.id
      LEFT JOIN maintenances m ON v.maintenance_id = m.id
      WHERE v.id = $1;
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  // Método bônus: Buscar visitas atreladas a uma manutenção específica
  async getVisitsByMaintenanceId(maintenanceId) {
    const query = `
      SELECT 
        v.*, 
        u.name AS unit_name, 
        t.name AS technician_name,
        c.name AS company_name, 
        et.name AS equipment_type_name
      FROM visits v
      LEFT JOIN manufacturing_units u ON v.unit_id = u.id
      LEFT JOIN technicians t ON v.technician_id = t.id
      LEFT JOIN companies c ON v.company_id = c.id
      LEFT JOIN equipment_types et ON v.equipment_type_id = et.id
      WHERE v.maintenance_id = $1
      ORDER BY v.date DESC, v.start_time DESC;
    `;
    const result = await db.query(query, [maintenanceId]);
    return result.rows;
  }

  async updateVisit(id, data) {
    const fields = Object.keys(data);
    const values = Object.values(data);
    
    // Atualização parcial dinâmica, igual fizemos em maintenances
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const query = `UPDATE visits SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *;`;
    
    const result = await db.query(query, [...values, id]);
    return result.rows[0];
  }

  async deleteVisit(id) {
    // Hard delete, pois não há coluna 'active' na tabela de visitas
    const query = 'DELETE FROM visits WHERE id = $1 RETURNING *;';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = new VisitService();