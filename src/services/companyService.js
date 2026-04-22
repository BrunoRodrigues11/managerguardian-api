const db = require('../config/db');

class CompanyService {
  
  // Função auxiliar privada para limpar e traduzir os dados do Front-end pro Banco
  _sanitizeData(data) {
    const payload = {};
    for (const [key, value] of Object.entries(data)) {
      if (key === 'id') continue; // Ignora o ID no corpo da requisição
      
      let dbKey = key;
      // Traduz camelCase para snake_case
      dbKey = dbKey.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      
      // Mapeamento específico: O front-end envia "cnpj", mas no banco a coluna é "document"
      if (dbKey === 'cnpj') dbKey = 'document';
      
      payload[dbKey] = value;
    }
    return payload;
  }

  async createCompany(data) {
    const payload = this._sanitizeData(data);
    const fields = Object.keys(payload);
    const values = Object.values(payload);
    
    if (fields.length === 0) throw new Error('Nenhum dado fornecido para criação.');

    // Cria as marcações $1, $2, $3 dinamicamente
    const placeholders = fields.map((_, index) => `$${index + 1}`).join(', ');
    
    const query = `
      INSERT INTO companies (${fields.join(', ')}) 
      VALUES (${placeholders}) 
      RETURNING *;
    `;
    
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
    const payload = this._sanitizeData(data);
    const fields = Object.keys(payload);
    const values = Object.values(payload);
    
    if (fields.length === 0) throw new Error('Nenhum dado fornecido para atualização.');

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const query = `UPDATE companies SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *;`;
    
    const result = await db.query(query, [...values, id]);
    return result.rows[0];
  }

  async deleteCompany(id) {
    // Soft delete
    const query = 'UPDATE companies SET active = false WHERE id = $1 RETURNING *;';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = new CompanyService();