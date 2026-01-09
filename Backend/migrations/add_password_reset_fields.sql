/**
 * ============================================================
 * MIGRACIÓN DE BASE DE DATOS - RECUPERACIÓN DE CONTRASEÑA
 * Archivo: Backend/migrations/add_password_reset_fields.sql
 * PROPÓSITO:
 *  - Agregar campos para almacenar tokens de recuperación
 *  - Crear índices para optimizar búsquedas de tokens
 *  - Permitir funcionalidad de "Olvidé mi contraseña"
 * 
 * CAMPOS AGREGADOS:
 *  - reset_token: Token único para recuperación (VARCHAR 255)
 *  - reset_token_expires: Fecha de expiración del token (DATETIME)
 * ============================================================
 */

USE login;

-- Agregar columna para el token de recuperación
ALTER TABLE users 
ADD COLUMN reset_token VARCHAR(255) DEFAULT NULL,
ADD COLUMN reset_token_expires DATETIME DEFAULT NULL;

-- Crear índice para mejorar las búsquedas por token
CREATE INDEX idx_reset_token ON users(reset_token);

-- Verificar los cambios
DESCRIBE users;
