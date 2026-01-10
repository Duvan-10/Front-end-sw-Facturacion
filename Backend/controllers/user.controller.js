// ruta: Backend/controllers/user.controller.js

import { createUser, findUserByIdentification, findUserByEmail } from '../models/user.model.js';
import pool from '../models/db.js';

// Controlador para crear un nuevo usuario (SOLO ADMIN)
export const createNewUser = async (req, res) => {
    try {
        const { name, identification, email, password, role = 'user' } = req.body;

        // 1. Validar que el usuario autenticado sea admin
        // Traemos el usuario de la BD para verificar su rol (más seguro que confiar en el token)
        const [userRows] = await pool.query(
            'SELECT role FROM users WHERE id = ?',
            [req.user.id]
        );

        if (!userRows.length || userRows[0].role !== 'admin') {
            return res.status(403).json({ 
                message: 'Acceso denegado. Solo los administradores pueden crear usuarios.' 
            });
        }

        // 2. Validar que la cédula no esté registrada
        const existingByIdentification = await findUserByIdentification(identification);
        if (existingByIdentification) {
            return res.status(409).json({ message: 'La identificación (Cédula) ya está registrada.' });
        }

        // 3. Validar que el email no esté registrado
        const existingByEmail = await findUserByEmail(email);
        if (existingByEmail) {
            return res.status(409).json({ message: 'El correo electrónico ya está en uso.' });
        }

        // 4. Validar que el rol sea válido
        const validRoles = ['admin', 'user'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ 
                message: `Rol inválido. Roles permitidos: ${validRoles.join(', ')}` 
            });
        }

        // 5. Crear el usuario
        const userId = await createUser({ name, identification, email, password, role });

        // 6. Respuesta de éxito
        res.status(201).json({
            message: 'Usuario creado exitosamente',
            userId: userId,
            user: {
                id: userId,
                name,
                email,
                identification,
                role
            }
        });

    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// Controlador para listar todos los usuarios (SOLO ADMIN)
export const getAllUsers = async (req, res) => {
    try {
        // 1. Validar que el usuario sea admin
        const [userRows] = await pool.query(
            'SELECT role FROM users WHERE id = ?',
            [req.user.id]
        );

        if (!userRows.length || userRows[0].role !== 'admin') {
            return res.status(403).json({ 
                message: 'Acceso denegado. Solo los administradores pueden listar usuarios.' 
            });
        }

        // 2. Obtener todos los usuarios (sin incluir contraseñas)
        const [users] = await pool.query(
            'SELECT id, name, identification, email, role, created_at FROM users ORDER BY created_at DESC'
        );

        res.status(200).json({
            message: 'Usuarios obtenidos exitosamente',
            count: users.length,
            users
        });

    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// Controlador para actualizar un usuario (SOLO ADMIN)
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, identification, email, password, role } = req.body;

        // 1. Validar que el usuario sea admin
        const [userRows] = await pool.query(
            'SELECT role FROM users WHERE id = ?',
            [req.user.id]
        );

        if (!userRows.length || userRows[0].role !== 'admin') {
            return res.status(403).json({ 
                message: 'Acceso denegado. Solo los administradores pueden actualizar usuarios.' 
            });
        }

        // 2. Verificar que el usuario a actualizar existe
        const [existingUser] = await pool.query(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );

        if (!existingUser.length) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        // 3. Validar que la cédula no esté en uso por otro usuario
        if (identification && identification !== existingUser[0].identification) {
            const [dupIdentification] = await pool.query(
                'SELECT id FROM users WHERE identification = ? AND id != ?',
                [identification, id]
            );
            if (dupIdentification.length) {
                return res.status(409).json({ message: 'La identificación (Cédula) ya está registrada por otro usuario.' });
            }
        }

        // 4. Validar que el email no esté en uso por otro usuario
        if (email && email !== existingUser[0].email) {
            const [dupEmail] = await pool.query(
                'SELECT id FROM users WHERE email = ? AND id != ?',
                [email, id]
            );
            if (dupEmail.length) {
                return res.status(409).json({ message: 'El correo electrónico ya está en uso por otro usuario.' });
            }
        }

        // 5. Validar rol si se proporciona
        const validRoles = ['admin', 'user'];
        if (role && !validRoles.includes(role)) {
            return res.status(400).json({ 
                message: `Rol inválido. Roles permitidos: ${validRoles.join(', ')}` 
            });
        }

        // 6. Construir query de actualización
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
        if (role) {
            updates.push('role = ?');
            values.push(role);
        }
        if (password) {
            const bcrypt = await import('bcrypt');
            const hashedPassword = await bcrypt.hash(password, 10);
            updates.push('password = ?');
            values.push(hashedPassword);
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'No se proporcionaron campos para actualizar.' });
        }

        values.push(id);

        await pool.query(
            `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        // 7. Obtener usuario actualizado
        const [updatedUser] = await pool.query(
            'SELECT id, name, identification, email, role, created_at FROM users WHERE id = ?',
            [id]
        );

        res.status(200).json({
            message: 'Usuario actualizado exitosamente',
            user: updatedUser[0]
        });

    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// Controlador para eliminar un usuario (SOLO ADMIN)
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Validar que el usuario sea admin
        const [userRows] = await pool.query(
            'SELECT role FROM users WHERE id = ?',
            [req.user.id]
        );

        if (!userRows.length || userRows[0].role !== 'admin') {
            return res.status(403).json({ 
                message: 'Acceso denegado. Solo los administradores pueden eliminar usuarios.' 
            });
        }

        // 2. Verificar que el usuario a eliminar existe
        const [existingUser] = await pool.query(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );

        if (!existingUser.length) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        // 3. Evitar que el admin se elimine a sí mismo
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta.' });
        }

        // 4. Eliminar usuario
        await pool.query('DELETE FROM users WHERE id = ?', [id]);

        res.status(200).json({
            message: 'Usuario eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};
