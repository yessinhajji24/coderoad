// Connexion à MySQL.
// Un "pool" garde plusieurs connexions ouvertes et les réutilise :
// c'est beaucoup plus rapide que d'ouvrir une connexion à chaque requête.
require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'coderoad',
  charset: 'utf8mb4', // pour que les accents restent corrects
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
