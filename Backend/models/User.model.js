// ruta: Backend/models/user.model.js

import pool from './db.js';
import bcrypt from 'bcryptjs';

// Función para encontrar un usuario por ID de cédula
export const findUserByIdentification = async (identification) => {
    // Consulta la tabla 'users' para verificar si la cédula ya existe
    const [rows] = await pool.query(
        'SELECT id, identification, email, name, password, role FROM users WHERE identification = ?', 
        [identification]
    );
    return rows[0]; // Retorna el usuario si existe, o undefined/null
};

// Función para encontrar un usuario por email (necesario para el Login)
export const findUserByEmail = async (email) => {
    const [rows] = await pool.query(
        'SELECT id, identification, email, name, password, role FROM users WHERE email = ?',
        [email]
    );
    return rows[0];
};

// Función para crear un nuevo usuario
export const createUser = async ({ name, identification, email, password, role = 'user' }) => {
    // 1. Encriptar la contraseña (seguridad)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 2. Ejecutar la consulta de inserción
    const [result] = await pool.query(
        'INSERT INTO users (name, identification, email, password, role) VALUES (?, ?, ?, ?, ?)',
        [name, identification, email, hashedPassword, role]
    );

    // 3. Retornar el ID del usuario creado
    return result.insertId;
};

// Función para verificar si existen usuarios en el sistema
export const hasUsers = async () => {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM users');
    return rows[0].count > 0;
};

// Exportar bcrypt para uso en el controlador de Login
export { bcrypt };