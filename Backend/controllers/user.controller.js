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
        const validRoles = ['admin', 'user', 'empleado'];
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
