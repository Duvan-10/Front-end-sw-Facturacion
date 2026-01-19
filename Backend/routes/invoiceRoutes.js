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
router.put('/:id/estado', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado) {
        return res.status(400).json({ error: "Estado es requerido" });
    }

    try {
        const db = (await import('../models/db.js')).default;
        
        // Detectar si existe columna estado_vencimiento
        const [columns] = await db.query(
            "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'facturas' AND COLUMN_NAME = 'estado_vencimiento'"
        );
        const hasEstadoVencimiento = columns.length > 0;

        // Si el nuevo estado es 'Pagada', marcar estado_vencimiento como 'Finalizada'
        // sin importar si era Vencida, Vigente u otro estado anterior
        let updateQuery = 'UPDATE facturas SET estado = ?';
        let params = [estado];
        
        if (hasEstadoVencimiento && estado === 'Pagada') {
            updateQuery += ', estado_vencimiento = ?';
            params.push('Finalizada');
        }
        
        updateQuery += ' WHERE id = ?';
        params.push(id);

        const [result] = await db.query(updateQuery, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Factura no encontrada" });
        }

        res.json({ success: true, message: "Estado actualizado exitosamente" });
    } catch (error) {
        console.error("Error al actualizar estado:", error);
        res.status(500).json({ error: "Error al actualizar estado: " + error.message });
    }
});
router.post('/:id/emit', authMiddleware, check('emitInvoice', invoiceController.emitInvoice));
router.delete('/:id', authMiddleware, check('deleteInvoice', invoiceController.deleteInvoice));

export default router;