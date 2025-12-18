// ruta: Backend/routes/cliente.routes.js (FINAL - SIN RUTA DELETE)

import { Router } from 'express';
import clienteController from '../controllers/clienteController.js'; 
import { authenticate } from '../middleware/auth.middleware.js'; 

const router = Router();

// Rutas funcionales (Creación, Listado, Edición por ID, Actualización)
router.post('/', authenticate, clienteController.createCliente);
router.get('/', authenticate, clienteController.getClientes);
router.get('/:id', authenticate, clienteController.getClienteById);
router.put('/:id', authenticate, clienteController.updateCliente);

// 🚨 RUTA DE ELIMINACIÓN DESACTIVADA
// router.delete('/:id', authenticate, clienteController.deleteCliente); 

export default router;