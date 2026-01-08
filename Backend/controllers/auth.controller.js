// ruta: Backend/controllers/auth.controller.js

import { createUser, findUserByIdentification, findUserByEmail, hasUsers, bcrypt } from '../models/user.model.js';
import jwt from 'jsonwebtoken';
// Cargar el secreto JWT desde las variables de entorno
const JWT_SECRET = process.env.JWT_SECRET || 'secreto_super_seguro_por_defecto'; 


// Controlador para el REGISTRO de un nuevo usuario (SOLO PRIMER USUARIO)
export const register = async (req, res) => {
    try {
        const { name, identification, email, password } = req.body;

        // 1. VALIDACIÓN CRÍTICA: Solo permitir registro si NO hay usuarios en el sistema
        const usersExist = await hasUsers();
        if (usersExist) {
            return res.status(403).json({ 
                message: 'El registro está deshabilitado. Solo el administrador puede crear nuevos usuarios.' 
            });
        }

        // 2. Validar que la cédula no esté en la base de datos
        const existingUserByIdentification = await findUserByIdentification(identification);
        if (existingUserByIdentification) {
            return res.status(409).json({ message: 'La identificación (Cédula) ya está registrada.' });
        }

        // 3. Validar que el email no esté registrado
        const existingUserByEmail = await findUserByEmail(email);
        if (existingUserByEmail) {
            return res.status(409).json({ message: 'El correo electrónico ya está en uso.' });
        }
        
        // 4. Este es el primer usuario, será admin
        const userId = await createUser({ name, identification, email, password, role: 'admin' });

        // 5. Respuesta de éxito
        res.status(201).json({ 
            message: 'Usuario administrador registrado con éxito',
            userId: userId,
            role: 'admin'
        });

    } catch (error) {
        console.error('Error en el registro de usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};


// Controlador para el LOGIN (Inicio de Sesión)
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Buscar usuario por email
        const user = await findUserByEmail(email);

        // 2. Verificar que el usuario exista y que la contraseña sea correcta
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Credenciales inválidas (correo o contraseña incorrectos).' });
        }

        // 3. Generar un Token JWT (Token de sesión)
        const token = jwt.sign(
            { id: user.id, email: user.email }, // Payload (datos del usuario)
            JWT_SECRET, 
            { expiresIn: '7d' } // Expira en 7 días
        );

        // 4. Respuesta de éxito, enviando el token y datos básicos del usuario al Frontend
        res.status(200).json({ 
            message: 'Login exitoso',
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                identification: user.identification,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Error en el inicio de sesión:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};


// Controlador para verificar si existen usuarios registrados
export const checkHasUsers = async (req, res) => {
    try {
        const usersExist = await hasUsers();
        res.status(200).json({ hasUsers: usersExist });
    } catch (error) {
        console.error('Error al verificar usuarios:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};