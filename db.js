require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');

// Configuracion de conexion a TiDB Cloud
// TiDB Cloud requiere SSL, por eso se incluye el certificado CA.
// En local se lee el certificado desde un archivo (DB_CA_PATH).
// En Vercel no hay archivo, asi que el certificado se guarda directamente
// como texto en la variable de entorno DB_CA_CONTENT.
function obtenerCertificadoCA() {
  if (process.env.DB_CA_CONTENT) {
    return process.env.DB_CA_CONTENT;
  }
  return fs.readFileSync(process.env.DB_CA_PATH);
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    ca: obtenerCertificadoCA(),
    minVersion: 'TLSv1.2'
  },
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool;
