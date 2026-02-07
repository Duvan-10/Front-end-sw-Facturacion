// ruta: Backend/controllers/auth.controller.js

import { 
    createUser, 
    findUserByIdentification, 
    findUserByEmail, 
    hasUsers, 
    createPasswordResetToken, 
    verifyPasswordResetToken, 
    updatePassword, 
    incrementFailedLoginAttempts,
    resetFailedLoginAttempts,
    lockUser,
    bcrypt 
} from '../models/user.model.js';
import { sendPasswordResetEmail } from '../config/email.config.js';
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

        // 2. Verificar que el usuario exista
        if (!user) {
            return res.status(404).json({ message: 'El usuario no existe.' });
        }

        // 3. Verificar si el usuario está bloqueado
        if (user.is_locked) {
            return res.status(423).json({ message: 'Usuario bloqueado por intentos fallidos. Contacta al administrador.' });
        }

        // 4. Verificar contraseña
        const passwordIsValid = await bcrypt.compare(password, user.password);
        if (!passwordIsValid) {
            const attempts = await incrementFailedLoginAttempts(user.id);
            if (attempts >= 2) {
                await lockUser(user.id);
                return res.status(423).json({ message: 'Usuario bloqueado por intentos fallidos. Debe restablecer la contraseña.' });
            }

            return res.status(401).json({ message: 'Credenciales inválidas (usuario o contraseña incorrectos).' });
        }

        // 5. Resetear intentos fallidos si el login es correcto
        await resetFailedLoginAttempts(user.id);

        // 6. Generar un Token JWT (Token de sesión)
        const token = jwt.sign(
            { id: user.id, email: user.email }, // Payload (datos del usuario)
            JWT_SECRET, 
            { expiresIn: '7d' } // Expira en 7 días
        );

        // 7. Respuesta de éxito, enviando el token y datos básicos del usuario al Frontend
        res.status(200).json({ 
            message: 'Login exitoso',
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                identification: user.identification,
                role: user.role,
                profile_photo: user.profile_photo || null
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


// Controlador para solicitar recuperación de contraseña
export const forgotPassword = async (req, res) => {
    try {
        const { identificacion } = req.body;

        // 1. Buscar usuario por número de identificación
        const user = await findUserByIdentification(identificacion);

        if (!user) {
            return res.status(404).json({ 
                message: 'No se encontró un usuario con ese número de identificación.' 
            });
        }

        // 2. Generar token de recuperación
        const resetToken = await createPasswordResetToken(user.id);

        // 3. Enviar email de recuperación
        try {
            await sendPasswordResetEmail(user.email, user.name, resetToken);

            // 4. Respuesta al frontend
            res.status(200).json({ 
                message: `Se ha enviado un enlace de recuperación al correo: ${user.email}`
            });

        } catch (emailError) {
            console.error('❌ Error al enviar email:', emailError);
            
            // Si falla el envío de email, devolver error específico
            return res.status(500).json({ 
                message: 'Error al enviar el correo de recuperación. Verifica la configuración del servidor de email.',
                error: process.env.NODE_ENV === 'development' ? emailError.message : undefined
            });
        }

    } catch (error) {
        console.error('Error en recuperación de contraseña:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};


// Controlador para restablecer la contraseña
export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        // 1. Verificar el token
        const user = await verifyPasswordResetToken(token);

        if (!user) {
            return res.status(400).json({ 
                message: 'El enlace de recuperación es inválido o ha expirado.' 
            });
        }

        // 2. Actualizar la contraseña
        await updatePassword(user.id, newPassword);

        // 3. Respuesta de éxito
        res.status(200).json({ 
            message: 'Contraseña actualizada exitosamente.' 
        });

    } catch (error) {
        console.error('Error al restablecer contraseña:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};