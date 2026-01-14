// Backend/routes/producto.routes.js

import express from 'express';
// 1. Corregimos la importación de las funciones del controlador
import { 
    getProductoByCodigo, 
    getAllProductos, 
    getProductoById, 
    createProducto, 
    updateProducto,
    deleteProducto
} from '../controllers/productoController.js'; 

// 2. Importamos el middleware correctamente
import authMiddleware from '../middleware/auth.middleware.js'; 

const router = express.Router();

// 3. Usamos 'authMiddleware' en lugar de 'authenticate' para que coincida con el import
// Las rutas específicas DEBEN ir antes de las rutas con parámetros
router.get('/codigo/:codigo', authMiddleware, getProductoByCodigo);
router.get('/', authMiddleware, getAllProductos);
router.post('/', authMiddleware, createProducto);
router.get('/:id', authMiddleware, getProductoById); 
router.put('/:id', authMiddleware, updateProducto);
router.delete('/:id', authMiddleware, deleteProducto);

export default router;