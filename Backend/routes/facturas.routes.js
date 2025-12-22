// Front-end-sw-Facturacion\Backend\routes\facturas.routes.js

import express from 'express';
import db from '../config/db.config.js';
import invoiceController from '../controllers/invoice.controller.js';

const router = express.Router();
 


// PRUEBA DE ACCESO DIRECTO
router.get('/proximo-numero', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT IFNULL(MAX(id), 0) + 1 as nextId FROM facturas');
        const proximoId = rows[0].nextId;
        const numeroFactura = `FAC-${String(proximoId).padStart(4, '0')}`;
        
        // Enviamos la respuesta sin validar tokens por ahora
        return res.status(200).json({ numero: numeroFactura });
    } catch (error) {
        console.error("Error en DB:", error);
        return res.status(500).json({ error: "Error al consultar la base de datos" });
    }
});

//BUSCAR PRODUCTOS
router.get('/buscar-productos', invoiceController.searchProducts);

/**
 * RUTA EXISTENTE: Guardar Factura
 */
router.post('/', async (req, res) => {
    const { 
        cliente_id, 
        tipo_pago, 
        fecha_emision, 
        total, 
        detalles 
    } = req.body;

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const estadoFinal = (tipo_pago === 'Contado') ? 'Pagada' : 'Pendiente';

        // Generar número de factura (FAC-XXXX)
        const [rows] = await connection.query('SELECT IFNULL(MAX(id), 0) + 1 as nextId FROM facturas');
        const proximoId = rows[0].nextId;
        const numeroFactura = `FAC-${String(proximoId).padStart(4, '0')}`;

        // INSERTAR ENCABEZADO
        const [resultFactura] = await connection.query(
            `INSERT INTO facturas (numero_factura, cliente_id, tipo_pago, status, total, fecha_creacion) 
             VALUES (?, ?, ?, ?, ?, ?)`, 
            [numeroFactura, cliente_id, tipo_pago, estadoFinal, total, fecha_emision]
        );

        const facturaId = resultFactura.insertId;

        // INSERTAR DETALLES
        const queriesDetalles = detalles.map(prod => {
            const totalLinea = prod.total * 1.19; 

            return connection.query(
                `INSERT INTO factura_detalles (factura_id, producto_id, cantidad, precio_unitario, subtotal, total) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [facturaId, prod.producto_id, prod.cant, prod.unit, prod.total, totalLinea]
            );
        });

        await Promise.all(queriesDetalles);

        await connection.commit();

        res.json({ 
            success: true,
            message: "Factura guardada correctamente", 
            id: facturaId, 
            status: estadoFinal 
        });

    } catch (error) {
        await connection.rollback();
        console.error("Error al guardar factura:", error);
        res.status(500).json({ error: "Error interno al procesar la factura" });
    } finally {
        connection.release();
    }
});

export default router;