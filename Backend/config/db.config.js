// Backend/config/db.config.js
import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'login',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const db = pool.promise();

console.log('✅ Conexión a la base de datos configurada');

// 🚨 ESTA ES LA LÍNEA CLAVE PARA QUITAR EL ERROR DE SYNTAXERROR
export default db;