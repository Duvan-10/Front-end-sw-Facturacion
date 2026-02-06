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
        'SELECT id, identification, email, name, password, role, profile_photo, failed_login_attempts, is_locked FROM users WHERE email = ?',
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

// Función para generar un token de recuperación de contraseña
export const createPasswordResetToken = async (userId) => {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expires = new Date(Date.now() + 3600000); // Token válido por 1 hora
    
    // Guardar el token en la base de datos
    await pool.query(
        'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
        [token, expires, userId]
    );
    
    return token;
};

// Función para verificar un token de recuperación
export const verifyPasswordResetToken = async (token) => {
    const [rows] = await pool.query(
        'SELECT id, email FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
        [token]
    );
    return rows[0];
};

// Función para actualizar la contraseña de un usuario
export const updatePassword = async (userId, newPassword) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    await pool.query(
        'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL, failed_login_attempts = 0, is_locked = 0 WHERE id = ?',
        [hashedPassword, userId]
    );
};

// Incrementar intentos fallidos de login
export const incrementFailedLoginAttempts = async (userId) => {
    await pool.query(
        'UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = ?',
        [userId]
    );

    const [rows] = await pool.query(
        'SELECT failed_login_attempts FROM users WHERE id = ?',
        [userId]
    );

    return rows[0]?.failed_login_attempts ?? 0;
};

// Resetear intentos fallidos
export const resetFailedLoginAttempts = async (userId) => {
    await pool.query(
        'UPDATE users SET failed_login_attempts = 0 WHERE id = ?',
        [userId]
    );
};

// Bloquear usuario
export const lockUser = async (userId) => {
    await pool.query(
        'UPDATE users SET is_locked = 1 WHERE id = ?',
        [userId]
    );
};

// Exportar bcrypt para uso en el controlador de Login
export { bcrypt };