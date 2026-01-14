import express from 'express';
import clienteController from '../controllers/cliente.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// Ruta de búsqueda para el autocompletado - DEBE IR ANTES DE :id
router.get('/buscar', authMiddleware, clienteController.searchClientes);
router.get('/identificacion/:identificacion', authMiddleware, clienteController.getClienteByIdentificacion);

// Rutas estándar de CRUD
router.get('/', authMiddleware, clienteController.getClientes);
router.post('/', authMiddleware, clienteController.createCliente);
router.get('/:id', authMiddleware, clienteController.getClienteById);
router.put('/:id', authMiddleware, clienteController.updateCliente);
router.delete('/:id', authMiddleware, clienteController.deleteCliente);

export default router;