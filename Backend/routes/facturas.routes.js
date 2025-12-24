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
    // 1. EXTRAER TODAS LAS VARIABLES (Aquí faltaba 'iva' y 'subtotal')
    const { 
        cliente_id, 
        pago,
        fecha, 
        subtotal, 
        iva, 
        total, 
        productos
    } = req.body;

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const estadoFinal = (pago === 'Si') ? 'Pagada' : 'Pendiente';

        const [rows] = await connection.query('SELECT IFNULL(MAX(id), 0) + 1 as nextId FROM facturas');
        const proximoId = rows[0].nextId;
        const numeroFactura = `FAC-${String(proximoId).padStart(4, '0')}`;

        // 2. INSERTAR ENCABEZADO (Usando las variables extraídas arriba)
            const [resultFactura] = await connection.query(
        `INSERT INTO facturas (numero_factura, cliente_id, fecha_emision, subtotal, iva, total, estado) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`, 
        [numeroFactura, cliente_id, fecha, subtotal, iva, total, estadoFinal]
    );
    

        const facturaId = resultFactura.insertId;
        

        // 4. INSERT DETALLES (Ajustado a los nombres del array de productos)
        const queriesDetalles = productos.map(prod => {
            return connection.query(
                `INSERT INTO factura_detalles (factura_id, producto_id, cantidad, precio_unitario, subtotal, total) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    facturaId, 
                    prod.producto_id, 
                    prod.cantidad, 
                    prod.vUnitario, 
                    prod.vTotal, 
                    prod.vTotal // Puedes ajustar esto si manejas IVA por línea
                ]
            );
        });

        await Promise.all(queriesDetalles);
        await connection.commit();

        res.json({ success: true, message: "Factura guardada!", id: facturaId });

    } catch (error) {
        await connection.rollback();
        console.error("Error detallado en Backend:", error);
        res.status(500).json({ error: error.message }); // Para ver el error real en el frontend
    } finally {
        connection.release();
    }
});

export default router;