-- Migración: Agregar campo para foto de perfil
-- Fecha: 2026-01-16
-- Descripción: Añade columna profile_photo a la tabla users para almacenar la ruta de la foto de perfil
-- Las fotos se guardan en: pictures/Profile/

ALTER TABLE users 
ADD COLUMN profile_photo VARCHAR(255) DEFAULT NULL COMMENT 'Ruta de la foto de perfil del usuario';

-- Verificar cambios
DESCRIBE users;
