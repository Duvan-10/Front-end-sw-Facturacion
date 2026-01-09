// Backend/routes/auth.routes.js

import { Router } from 'express'; 
// ⬅️ Las funciones 'register', 'login' y 'checkHasUsers' se importan desde el controlador.
import { register, login, checkHasUsers } from '../controllers/auth.controller.js';

 const router = Router();  

// Rutas de Autenticación
// ⬅️ Solo usamos las funciones importadas aquí
router.get('/has-users', checkHasUsers); // Verifica si existen usuarios
router.post('/register', register); 
router.post('/login', login);

export default router;