// Backend/routes/producto.routes.js

import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js'; 
import { getProductoByCodigo,getAllProductos, getProductoById, createProducto, updateProducto } 
from '../controllers/productoController.js';

const router = express.Router();

// Las rutas requieren autenticación (verificación de token JWT)
router.get('/', authenticate, getAllProductos);
router.get('/:id', authenticate, getProductoById); // <-- 🚨 RUTA AGREGADA PARA OBTENER UN PRODUCTO
router.post('/', authenticate, createProducto);
router.put('/:id', authenticate, updateProducto);
router.get('/codigo/:codigo', getProductoByCodigo);

export default router;