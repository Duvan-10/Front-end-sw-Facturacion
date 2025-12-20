import express from 'express';
import db from '../config/db.config.js';

const router = express.Router();

router.post('/', async (req, res) => {
    // 1. Recibimos los datos del InvoiceForm.jsx
    const { 
        cliente_id, 
        tipo_pago, 
        fecha_emision, 
        total, // Total general de la factura
        detalles 
    } = req.body;

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 2. LÓGICA DE ESTADO AUTOMÁTICO
        // 'Contado' -> Pagada | 'Crédito' -> Pendiente
        const estadoFinal = (tipo_pago === 'Contado') ? 'Pagada' : 'Pendiente';

        // 3. Generar número de factura (FAC-XXXX)
        const [rows] = await connection.query('SELECT IFNULL(MAX(id), 0) + 1 as nextId FROM facturas');
        const proximoId = rows[0].nextId;
        const numeroFactura = `FAC-${String(proximoId).padStart(4, '0')}`;

        // 4. INSERTAR ENCABEZADO (Tabla: facturas)
        const [resultFactura] = await connection.query(
            `INSERT INTO facturas (numero_factura, cliente_id, tipo_pago, status, total, fecha_creacion) 
             VALUES (?, ?, ?, ?, ?, ?)`, 
            [numeroFactura, cliente_id, tipo_pago, estadoFinal, total, fecha_emision]
        );

        const facturaId = resultFactura.insertId;

        // 5. INSERTAR DETALLES (Tabla: factura_detalles según tu imagen)
        const queriesDetalles = detalles.map(prod => {
            // Calculamos el total de la línea (unit * cant * 1.19 si manejas IVA del 19%)
            const totalLinea = prod.total * 1.19; 

            return connection.query(
                `INSERT INTO factura_detalles (factura_id, producto_id, cantidad, precio_unitario, subtotal, total) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [facturaId, prod.producto_id, prod.cant, prod.unit, prod.total, totalLinea]
            );
        });

        await Promise.all(queriesDetalles);

        // Si todo sale bien, confirmamos los cambios
        await connection.commit();

        res.json({ 
            success: true,
            message: "Factura guardada correctamente", 
            id: facturaId, 
            status: estadoFinal 
        });

    } catch (error) {
        // Si hay error, deshacemos todo para no dejar datos huérfanos
        await connection.rollback();
        console.error("Error al guardar factura:", error);
        res.status(500).json({ error: "Error interno al procesar la factura" });
    } finally {
        connection.release();
    }
});

export default router;