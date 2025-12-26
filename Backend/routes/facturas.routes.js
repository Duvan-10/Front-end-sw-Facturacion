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


/**RUTA EXISTENTE: Guardar Factura*/
 
// En Backend/routes/facturas.routes.js

router.post('/', async (req, res) => {
    // 1. EXTRAER con los nombres exactos que vienen del Frontend
    const { 
        cliente_id, 
        pago,
        subtotal, 
        iva,      // Asegúrate que en logica.js se llame 'iva'
        total,    // Asegúrate que en logica.js se llame 'total'
        productos
    } = req.body;

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Determinar estado
        const estadoFinal = (pago === 'Si') ? 'Pagada' : 'Pendiente';

        // Generar número de factura
        const [rows] = await connection.query('SELECT IFNULL(MAX(id), 0) + 1 as nextId FROM facturas');
        const proximoId = rows[0].nextId;
        const numeroFactura = `FAC-${String(proximoId).padStart(4, '0')}`;

        // 2. INSERTAR ENCABEZADO
        const [resultFactura] = await connection.query(
         `INSERT INTO facturas (numero_factura, cliente_id, fecha_emision, subtotal, iva, total, estado) 
         VALUES (?, ?, NOW(), ?, ?, ?, ?)`, 
        [
        numeroFactura, 
        cliente_id, 
        subtotal, 
        iva, 
        total, 
        estadoFinal]
        );

        const facturaId = resultFactura.insertId;

        // 3. INSERT DETALLES
        // IMPORTANTE: Mapeamos los nombres prod.vUnitario y prod.vTotal que vienen del front
        const queriesDetalles = productos.map(prod => {
            return connection.query(
                `INSERT INTO factura_detalles (factura_id, producto_id, cantidad, precio_unitario, subtotal, total) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    facturaId, 
                    prod.producto_id, 
                    prod.cantidad, 
                    prod.vUnitario, 
                    prod.vTotal, // subtotal de la línea
                    prod.vTotal  // total de la línea
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

export default router;