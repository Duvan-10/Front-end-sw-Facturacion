// Backend/routes/cliente.routes.js

import express from 'express';
// Importamos las funciones del controlador
import { getAllClientes, createCliente } from '../controllers/clienteController.js'; 
// Importamos el middleware (aunque lo quitemos temporalmente de las rutas)
import { verifyToken } from '../middleware/auth.middleware.js'; 

// 🚨 CRÍTICO: Definición del router
const router = express.Router(); 

// Rutas (Temporalmente sin verifyToken, para la prueba)
router.get('/', getAllClientes); // <-- Ruta GET para cargar clientes
router.post('/', createCliente); // <-- Ruta POST para registrar clientes

export default router;