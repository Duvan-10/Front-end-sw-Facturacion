// Backend/routes/producto.routes.js

import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js'; 
import { 
    getAllProductos, 
    createProducto, 
    updateProducto 
} from '../controllers/productoController.js';

const router = express.Router();

// Las rutas requieren autenticación (verificación de token JWT)
router.get('/', authenticate, getAllProductos);
router.post('/', authenticate, createProducto);
router.put('/:id', authenticate, updateProducto);

export default router;