// src/utils/dataSanitizer.js

/**
 * Converte as chaves de um objeto de camelCase (React) para snake_case (PostgreSQL)
 * e transforma strings vazias em NULL para evitar erros no banco.
 * * @param {Object} data - O objeto recebido do Front-end
 * @param {Array} excludeKeys - Array de chaves que não devem ir para a query SQL
 * @returns {Object} Payload formatado
 */
const sanitizeData = (data, excludeKeys = ['id']) => {
  const payload = {};
  
  for (const [key, value] of Object.entries(data)) {
    // Ignora as chaves que passarmos no array
    if (excludeKeys.includes(key)) continue;
    
    // Converte camelCase para snake_case
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    
    // Transforma strings vazias em NULL
    if (value === '') {
      payload[snakeKey] = null;
    } else {
      payload[snakeKey] = value;
    }
  }
  
  return payload;
};

module.exports = { sanitizeData };