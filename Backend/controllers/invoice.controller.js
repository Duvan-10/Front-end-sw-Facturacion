import db from '../models/db.js'; 

const invoiceController = {
    // 1. OBTENER TODAS LAS FACTURAS (Ya funcionando)
    getAllInvoices: async (req, res) => {
        try {
            const query = `
                SELECT f.id AS id_real, 
                f.numero_factura AS id, 
                c.nombre_razon_social AS client,
                f.fecha_emision AS date, 
                f.total, 
                f.tipo_pago AS tipoFactura, 
                f.estado AS status,
                (
                    SELECT COALESCE(
                        JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'producto_nombre', p.nombre,
                                'cantidad', fd.cantidad
                            )
                        ), 
                        JSON_ARRAY()
                    )
                    FROM factura_detalles fd
                    JOIN productos p ON fd.producto_id = p.id
                    WHERE fd.factura_id = f.id
                ) AS detalles
            FROM facturas f 
            JOIN clientes c ON f.cliente_id = c.id
            ORDER BY f.fecha_emision DESC;`;

            const [rows] = await db.query(query);
            
            const result = rows.map(row => ({
                ...row,
                detalles: typeof row.detalles === 'string' ? JSON.parse(row.detalles) : row.detalles
            }));

            res.json(result);
        } catch (error) { 
            res.status(500).json({ message: "Error al obtener facturas", error: error.message }); 
        }
    },

    // 2. OBTENER UNA FACTURA POR ID (Para cargar el formulario de edición)
getInvoiceById: async (req, res) => {
    try {
        const { id } = req.params;
        
        // 1. Obtener la cabecera (La información de la factura y el cliente)
        const [facturaRows] = await db.query(`
            SELECT f.id, f.numero_factura, f.fecha_emision, f.tipo_pago, f.cliente_id,
                   c.identificacion, c.nombre_razon_social, c.telefono, c.direccion
            FROM facturas f
            JOIN clientes c ON f.cliente_id = c.id
            WHERE f.id = ?`, [id]);

        // Si no hay resultados, enviamos 404
        if (facturaRows.length === 0) {
            return res.status(404).json({ message: "Factura no encontrada" });
        }

        const f = facturaRows[0];

        // 2. Obtener los detalles (Los productos de esa factura)
        const [detallesRows] = await db.query(`
            SELECT fd.producto_id, fd.cantidad, fd.precio_unitario, 
                   p.codigo AS code, 
                   CONCAT(p.nombre, ' - ', p.descripcion) AS combined_detail
            FROM factura_detalles fd
            JOIN productos p ON fd.producto_id = p.id
            WHERE fd.factura_id = ?`, [id]);

        // 3. Formatear la respuesta para el Frontend
        res.json({
            numero_factura: f.numero_factura,
            fecha_emision: f.fecha_emision,
            tipo_pago: f.tipo_pago,
            cliente: {
                id: f.cliente_id,
                identificacion: f.identificacion,
                nombre_razon_social: f.nombre_razon_social,
                telefono: f.telefono,
                direccion: f.direccion
            },
            detalles: detallesRows.map(d => ({
                producto_id: d.producto_id,
                code: d.code,
                cant: d.cantidad,
                detail: d.combined_detail, // Nombre - Descripción
                unit: d.precio_unitario,
                total: parseFloat(d.cantidad) * parseFloat(d.precio_unitario)
            }))
        });

    } catch (error) {
        console.error("Error en getInvoiceById:", error);
        res.status(500).json({ message: "Error interno en el servidor", error: error.message });
    }
},

    getNextNumber: async (req, res) => {
        try {
            const [rows] = await db.query("SELECT MAX(id) AS lastId FROM facturas");
            const nextId = (rows[0].lastId || 0) + 1;
            res.json({ numero_factura: `FAC-${nextId.toString().padStart(4, '0')}` });
        } catch (error) { res.status(500).json({ message: "Error al generar número" }); }
    },

    createInvoice: async (req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const { cliente_id, tipo_pago, fecha_emision, subtotal, iva, total, detalles } = req.body;

            const [lastRecord] = await connection.query("SELECT MAX(id) AS lastId FROM facturas");
            const nextId = (lastRecord[0].lastId || 0) + 1;
            const numFactura = `FAC-${nextId.toString().padStart(4, '0')}`;

            const [facturaResult] = await connection.query(
                "INSERT INTO facturas (numero_factura, cliente_id, fecha_emision, subtotal, iva, total, tipo_pago, estado) VALUES (?, ?, ?, ?, ?, ?, ?, 'Pendiente')",
                [numFactura, cliente_id, fecha_emision, Math.round(subtotal), Math.round(iva), Math.round(total), tipo_pago]
            );

            const facturaId = facturaResult.insertId;

            for (const item of detalles) {
                if (item.producto_id) {
                    await connection.query(
                        "INSERT INTO factura_detalles (factura_id, producto_id, cantidad, precio_unitario, subtotal, total) VALUES (?, ?, ?, ?, ?, ?)",
                        [facturaId, item.producto_id, item.cant, item.unit, Math.round(item.total), Math.round(item.total * 1.19)]
                    );
                }
            }

            await connection.commit();
            res.status(201).json({ success: true, numero_factura: numFactura });
        } catch (error) {
            if (connection) await connection.rollback();
            res.status(500).json({ message: error.sqlMessage || "Error al procesar" });
        } finally {
            if (connection) connection.release();
        }
    },

    // 3. ACTUALIZAR FACTURA (La lógica de edición)
    updateInvoice: async (req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const { id } = req.params;
            const { cliente_id, tipo_pago, fecha_emision, subtotal, iva, total, detalles } = req.body;

            // Actualizar cabecera
            await connection.query(
                "UPDATE facturas SET cliente_id = ?, tipo_pago = ?, fecha_emision = ?, subtotal = ?, iva = ?, total = ? WHERE id = ?",
                [cliente_id, tipo_pago, fecha_emision, Math.round(subtotal), Math.round(iva), Math.round(total), id]
            );

            // Borrar detalles anteriores para re-insertar los nuevos
            await connection.query("DELETE FROM factura_detalles WHERE factura_id = ?", [id]);

            // Insertar nuevos detalles modificados
            for (const item of detalles) {
                if (item.producto_id) {
                    await connection.query(
                        "INSERT INTO factura_detalles (factura_id, producto_id, cantidad, precio_unitario, subtotal, total) VALUES (?, ?, ?, ?, ?, ?)",
                        [id, item.producto_id, item.cant, item.unit, Math.round(item.total), Math.round(item.total * 1.19)]
                    );
                }
            }

            await connection.commit();
            res.json({ success: true, message: "Factura actualizada correctamente" });
        } catch (error) {
            if (connection) await connection.rollback();
            res.status(500).json({ message: "Error al actualizar la factura" });
        } finally {
            if (connection) connection.release();
        }
    }
};

export default invoiceController;