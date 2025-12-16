// Backend/routes/cliente.routes.js

import express from 'express';
// Importamos las funciones del controlador, incluyendo la nueva getClienteById
import { 
    getAllClientes, 
    getClienteById, // <-- NUEVA FUNCIÓN NECESARIA PARA EDICIÓN
    createCliente, 
    updateCliente 
} from '../controllers/clienteController.js'; 

// Importamos el middleware (aunque lo deshabilitaremos temporalmente)
import { authenticate } from '../middleware/auth.middleware.js'; 

const router = express.Router(); 

// NOTA: Para las pruebas iniciales de conexión, se recomienda comentar el middleware 'authenticate'.

// =======================================================
// RUTAS CORREGIDAS Y CONSOLIDADAS
// =======================================================

// 1. OBTENER TODOS LOS CLIENTES (GET /api/clientes)
router.get('/', /* authenticate, */ getAllClientes); 

// 2. OBTENER UN CLIENTE POR ID (GET /api/clientes/:id)
// Esta ruta es CRÍTICA para que ClientForm cargue los datos en modo edición
router.get('/:id', /* authenticate, */ getClienteById); 

// 3. REGISTRAR UN NUEVO CLIENTE (POST /api/clientes)
router.post('/', /* authenticate, */ createCliente); 

// 4. ACTUALIZAR UN CLIENTE EXISTENTE (PUT /api/clientes/:id)
router.put('/:id', /* authenticate, */ updateCliente);


export default router;