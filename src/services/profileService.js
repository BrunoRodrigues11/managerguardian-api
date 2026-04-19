const db = require('../config/db');

class ProfileService {
  async createProfile(data) {
    // Definimos objetos vazios {} como fallback caso o front-end não envie as permissões na criação
    const { name, permissions = {}, special_permissions = {} } = data;
    
    const query = `
      INSERT INTO profiles (name, permissions, special_permissions) 
      VALUES ($1, $2, $3) 
      RETURNING *;
    `;
    
    // A biblioteca 'pg' lida automaticamente com os objetos JS para JSONB
    const result = await db.query(query, [name, permissions, special_permissions]);
    return result.rows[0];
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
    const { name, permissions, special_permissions, active } = data;
    const query = `
      UPDATE profiles 
      SET name = $1, permissions = $2, special_permissions = $3, active = $4 
      WHERE id = $5 
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