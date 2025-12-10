// Backend/routes/cliente.routes.js

import express from 'express';
// Importamos las funciones del controlador
import { getAllClientes, createCliente, updateCliente } from '../controllers/clienteController.js';
// Importamos el middleware (aunque lo quitemos temporalmente de las rutas)
import { authenticate } from '../middleware/auth.middleware.js'; // ✅ Usar el nombre de exportación correcto

// 🚨 CRÍTICO: Definición del router
const router = express.Router(); 

// Rutas (Temporalmente sin verifyToken, para la prueba)
router.get('/', authenticate,getAllClientes); // <-- Ruta GET para cargar clientes
router.post('/', createCliente); // <-- Ruta POST para registrar clientes
router.get('/', authenticate, getAllClientes);
router.post('/', authenticate, createCliente); 
router.put('/:id', authenticate, updateCliente);

export default router;