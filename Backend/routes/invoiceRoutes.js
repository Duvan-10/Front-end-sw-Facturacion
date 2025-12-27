import express from 'express';
import invoiceController from '../controllers/invoice.controller.js';
import clienteController from '../controllers/cliente.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// --- VALIDACIÓN DE FUNCIONES ---




// Esto imprimirá en tu consola qué funciones están llegando vacías
const check = (name, fn) => {
    if (typeof fn !== 'function') {
        console.error(`❌ ERROR: La función "${name}" no está definida en el controlador.`);
        return (req, res) => res.status(500).send(`Error: ${name} no encontrada`);
    }
    return fn;
};



// --- RUTAS DE BÚSQUEDA ---
router.get('/proximo-numero', authMiddleware, check('getNextNumber', invoiceController.getNextNumber));
router.get('/buscar-clientes', authMiddleware, check('searchClientes', clienteController.searchClientes));
router.get('/buscar-productos', authMiddleware, check('searchProducts', invoiceController.searchProducts));

// --- RUTAS ESTÁNDAR ---
router.get('/', authMiddleware, check('getAllInvoices', invoiceController.getAllInvoices));
router.post('/', authMiddleware, check('createInvoice', invoiceController.createInvoice));
router.get('/:id', authMiddleware, check('getInvoiceById', invoiceController.getInvoiceById));
router.put('/:id', authMiddleware, check('updateInvoice', invoiceController.updateInvoice));

export default router;