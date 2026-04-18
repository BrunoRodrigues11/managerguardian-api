require("dotenv").config();
const { Pool } = require("pg");

// Verifica se estamos em ambiente de produção
const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,                        
});

pool.query("SELECT 1")
  .then(() => console.log(`✅ PostgreSQL conectado [${isProduction ? 'PROD' : 'LOCAL'}]`))
  .catch(err => console.error("❌ Erro ao conectar no PostgreSQL", err));

module.exports = pool;