import pool from '../models/db.js';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Obtener perfil del usuario actual
export const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const [rows] = await pool.query(
            'SELECT id, name, identification, email, role, profile_photo, created_at FROM users WHERE id = ?',
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.status(200).json({
            message: 'Perfil obtenido exitosamente',
            user: rows[0]
        });
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Actualizar datos del perfil (nombre, identificación, email)
export const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, identification, email } = req.body;

        // Validar que al menos un campo sea proporcionado
        if (!name && !identification && !email) {
            return res.status(400).json({ 
                message: 'Debes proporcionar al menos un campo para actualizar' 
            });
        }

        // Verificar si la identificación ya está en uso por otro usuario
        if (identification) {
            const [dupIdentification] = await pool.query(
                'SELECT id FROM users WHERE identification = ? AND id != ?',
                [identification, userId]
            );
            if (dupIdentification.length > 0) {
                return res.status(409).json({ 
                    message: 'La identificación ya está registrada por otro usuario' 
                });
            }
        }

        // Verificar si el email ya está en uso por otro usuario
        if (email) {
            const [dupEmail] = await pool.query(
                'SELECT id FROM users WHERE email = ? AND id != ?',
                [email, userId]
            );
            if (dupEmail.length > 0) {
                return res.status(409).json({ 
                    message: 'El correo electrónico ya está en uso por otro usuario' 
                });
            }
        }

        // Construir query de actualización
        const updates = [];
        const values = [];

        if (name) {
            updates.push('name = ?');
            values.push(name);
        }
        if (identification) {
            updates.push('identification = ?');
            values.push(identification);
        }
        if (email) {
            updates.push('email = ?');
            values.push(email);
        }

        values.push(userId);

        await pool.query(
            `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        // Obtener usuario actualizado
        const [updatedUser] = await pool.query(
            'SELECT id, name, identification, email, role, profile_photo, created_at FROM users WHERE id = ?',
            [userId]
        );

        res.status(200).json({
            message: 'Perfil actualizado exitosamente',
            user: updatedUser[0]
        });

    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Cambiar contraseña
export const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword, confirmPassword } = req.body;

        // Validaciones
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ 
                message: 'Todos los campos son obligatorios' 
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ 
                message: 'La nueva contraseña y su confirmación no coinciden' 
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ 
                message: 'La nueva contraseña debe tener al menos 6 caracteres' 
            });
        }

        // Obtener usuario con contraseña
        const [users] = await pool.query(
            'SELECT password FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Verificar contraseña actual
        const isPasswordValid = await bcrypt.compare(currentPassword, users[0].password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                message: 'La contraseña actual es incorrecta' 
            });
        }

        // Encriptar nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Actualizar contraseña
        await pool.query(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, userId]
        );

        res.status(200).json({
            message: 'Contraseña cambiada exitosamente'
        });

    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Subir/actualizar foto de perfil
export const uploadProfilePhoto = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!req.file) {
            return res.status(400).json({ 
                message: 'No se proporcionó ninguna imagen' 
            });
        }

        // Obtener foto anterior para eliminarla
        const [users] = await pool.query(
            'SELECT profile_photo FROM users WHERE id = ?',
            [userId]
        );

        if (users.length > 0 && users[0].profile_photo) {
            // Calcular ruta física en Front-End/src/Pictures
            const assetsRoot = path.join(__dirname, '../../Front-End/src');
            const relativePath = users[0].profile_photo.replace('/pictures/', 'Pictures/');
            const oldPhotoPath = path.join(assetsRoot, relativePath);
            if (fs.existsSync(oldPhotoPath)) {
                fs.unlinkSync(oldPhotoPath);
            }
        }

        // Guardar ruta de la nueva foto
        const photoPath = `/pictures/Profile/${req.file.filename}`;

        await pool.query(
            'UPDATE users SET profile_photo = ? WHERE id = ?',
            [photoPath, userId]
        );

        // Obtener usuario actualizado
        const [updatedUser] = await pool.query(
            'SELECT id, name, identification, email, role, profile_photo, created_at FROM users WHERE id = ?',
            [userId]
        );

        res.status(200).json({
            message: 'Foto de perfil actualizada exitosamente',
            user: updatedUser[0]
        });

    } catch (error) {
        console.error('Error al subir foto:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Exportaciones principales del módulo de perfil
// Obtener perfil del emisor para PDF (logo, datos fiscales, contacto)
export const getEmisorProfile = async (req, res) => {
    try {
        // Intentar leer desde una tabla dedicada si existe
        const [rows] = await pool.query('SELECT * FROM perfil_emisor LIMIT 1');
        if (rows.length) {
            return res.status(200).json(rows[0]);
        }

        // Fallback: construir a partir de datos mínimos si no existe la tabla o registro
        // Nota: Ajusta estos valores o la fuente según tu modelo real
        const fallback = {
            nombre_razon_social: 'Emisor',
            nit: '',
            direccion: '',
            ciudad: '',
            pais: '',
            telefono: '',
            logo_url: null
        };
        return res.status(200).json(fallback);
    } catch (error) {
        console.error('Error al obtener perfil emisor:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};