import express from 'express';
import db from '../config/db.config.js';
import invoiceController from '../controllers/invoice.controller.js';

const router = express.Router();


// OBTENER PRÓXIMO NÚMERO DE FACTURA
router.get('/proximo-numero', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT IFNULL(MAX(id), 0) + 1 as nextId FROM facturas');
        const proximoId = rows[0].nextId;
        const numeroFactura = `FAC-${String(proximoId).padStart(4, '0')}`;
        
        return res.status(200).json({ numero: numeroFactura });
    } catch (error) {
        console.error("Error en DB:", error);
        return res.status(500).json({ error: "Error al consultar la base de datos" });
    }
});

// BUSCAR PRODUCTOS
router.get('/buscar-productos', invoiceController.searchProducts);

// OBTENER UNA FACTURA POR ID
router.get('/:id', invoiceController.getInvoiceById);

// OBTENER TODAS LAS FACTURAS
router.get('/', invoiceController.getAllInvoices);

// CREAR FACTURA
router.post('/', async (req, res) => {
    const { fecha_vencimiento, cliente_id, productos } = req.body; 

    // --- CAPA DE SEGURIDAD

    // --- VALIDACIÓN: Fecha de vencimiento requerida ---
    if (!fecha_vencimiento) {
        return res.status(400).json({ error: "🚫 Error: Debe especificar la fecha de vencimiento." });
    }

    // --- VALIDACIÓN: Cliente inexistente o inválido ---
    if (!cliente_id) {
        return res.status(400).json({ error: "🚫 Error de Seguridad: ID de cliente no proporcionado o inválido." });
    }

    const connection = await db.getConnection();

    try {
        // VALIDACIÓN: ¿Existe el cliente en la BD?
        const [clienteExiste] = await connection.query(
            'SELECT id FROM clientes WHERE id = ?', 
            [cliente_id]
        );

        if (clienteExiste.length === 0) {
            connection.release(); // Importante liberar antes de retornar
            return res.status(404).json({ 
                error: "🚫 Alerta de Seguridad: El cliente seleccionado no existe en nuestra base de datos. Operación rechazada." 
            });
        }

        await connection.beginTransaction();

        // Estado inicial siempre es Pendiente
        const estadoFinal = 'Pendiente';

        // Generar número de factura
        const [rows] = await connection.query('SELECT IFNULL(MAX(id), 0) + 1 as nextId FROM facturas');
        const proximoId = rows[0].nextId;
        const numeroFactura = `FAC-${String(proximoId).padStart(4, '0')}`;

        // Insertar encabezado de factura
        const [resultFactura] = await connection.query(
         `INSERT INTO facturas (numero_factura, cliente_id, fecha_emision, fecha_vencimiento, subtotal, iva, total, estado) 
         VALUES (?, ?, NOW(), ?, ?, ?, ?, ?)`, 
        [
        numeroFactura, 
        cliente_id,
        fecha_vencimiento,
        req.body.subtotal, 
        req.body.iva, 
        req.body.total, 
        estadoFinal]
        );

        const facturaId = resultFactura.insertId;

        // Insertar detalles de productos
        const queriesDetalles = productos.map(prod => {
            return connection.query(
                `INSERT INTO factura_detalles (factura_id, producto_id, cantidad, precio_unitario, descuento, subtotal, total) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    facturaId, 
                    prod.producto_id, 
                    prod.cantidad, 
                    prod.precio, 
                    prod.descuento || 0,
                    prod.subtotal, 
                    prod.subtotal  
                ]
            );
        });

        await Promise.all(queriesDetalles);
        await connection.commit();

        res.json({ success: true, message: "Factura guardada!", id: facturaId });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Error detallado en Backend:", error);
        res.status(500).json({ error: "Error interno: " + error.message });
    } finally {
        if (connection) connection.release();
    }
});

// ACTUALIZAR ESTADO DE FACTURA
router.put('/:id/estado', async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado) {
        return res.status(400).json({ error: "Estado es requerido" });
    }

    try {
        const [result] = await db.query(
            'UPDATE facturas SET estado = ? WHERE id = ?',
            [estado, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Factura no encontrada" });
        }

        res.json({ success: true, message: "Estado actualizado exitosamente" });
    } catch (error) {
        console.error("Error al actualizar estado:", error);
        res.status(500).json({ error: "Error al actualizar estado: " + error.message });
    }
});

export default router;