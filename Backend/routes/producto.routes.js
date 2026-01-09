// Backend/routes/producto.routes.js

import express from 'express';
// 1. Corregimos la importación de las funciones del controlador
import { 
    getProductoByCodigo, 
    getAllProductos, 
    getProductoById, 
    createProducto, 
    updateProducto 
} from '../controllers/productoController.js'; 

// 2. Importamos el middleware correctamente
import authMiddleware from '../middleware/auth.middleware.js'; 

const router = express.Router();

// 3. Usamos 'authMiddleware' en lugar de 'authenticate' para que coincida con el import
router.get('/', authMiddleware, getAllProductos);
router.get('/:id', authMiddleware, getProductoById); 
router.post('/', authMiddleware, createProducto);
router.put('/:id', authMiddleware, updateProducto);

// 4. Agregamos el middleware también a la búsqueda por código si es necesario
router.get('/codigo/:codigo', authMiddleware, getProductoByCodigo);

export default router;