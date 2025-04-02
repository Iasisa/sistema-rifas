// src/backend/config/db.js
const sql = require('mssql');
require('dotenv').config();

const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: true, // Para conexiones Azure
    trustServerCertificate: true, // Cambiar a false en producción
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// Función para conectar a la base de datos
async function connectDB() {
  try {
    const pool = await sql.connect(config);
    console.log('Conexión exitosa a SQL Server');
    return pool;
  } catch (err) {
    console.error('Error al conectar a SQL Server:', err);
    // En producción, podrías querer reintentar la conexión o notificar a un sistema de monitoreo
    throw err;
  }
}

// Exportar conexión y objetos sql para uso en otros archivos
module.exports = {
  connectDB,
  sql,
  poolPromise: new sql.ConnectionPool(config).connect()
};