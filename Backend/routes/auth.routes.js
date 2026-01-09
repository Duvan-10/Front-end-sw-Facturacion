// Backend/routes/auth.routes.js

import { Router } from 'express'; 
// ⬅️ Las funciones 'register', 'login', 'checkHasUsers', 'forgotPassword' y 'resetPassword' se importan desde el controlador.
import { register, login, checkHasUsers, forgotPassword, resetPassword } from '../controllers/auth.controller.js';

 const router = Router();  

// Rutas de Autenticación
// ⬅️ Solo usamos las funciones importadas aquí
router.get('/has-users', checkHasUsers); // Verifica si existen usuarios
router.post('/register', register); 
router.post('/login', login);
router.post('/forgot-password', forgotPassword); // Solicitud de recuperación de contraseña
router.post('/reset-password', resetPassword); // Restablecer contraseña con token

export default router;