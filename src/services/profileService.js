const db = require('../config/db');
const { sanitizeData } = require('../utils/dataSanitizer');

class ProfileService {
  async createProfile(data) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      const payload = sanitizeData(data);
      const query = `
        INSERT INTO profiles (name, description, permissions, special_permissions, active)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;
      const result = await client.query(query, [
        payload.name, 
        payload.description,
        payload.permissions,
        payload.special_permissions,
        payload.active !== undefined ? payload.active : true
      ]);
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getAllProfiles() {
    const query = 'SELECT * FROM profiles WHERE active = true ORDER BY name ASC;';
    const result = await db.query(query);
    return result.rows;
  }

  async getProfileById(id) {
    const query = 'SELECT * FROM profiles WHERE id = $1 AND active = true;';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  async updateProfile(id, data) {
    const { name, permissions, special_permissions, active } = sanitizeData(data);
    const query = `
      UPDATE profiles 
      SET name = $1, description = $2, permissions = $3, special_permissions = $4, active = $5 
      WHERE id = $6 
      RETURNING *;
    `;
    const result = await db.query(query, [name, permissions, special_permissions, active, id]);
    return result.rows[0];
  }

  async deleteProfile(id) {
    // Soft delete: Desativamos o perfil para não quebrar a relação com os usuários que o possuem
    const query = 'UPDATE profiles SET active = false WHERE id = $1 RETURNING *;';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = new ProfileService();