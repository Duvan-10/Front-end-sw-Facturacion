import db from '../models/db.js'; 

const invoiceController = {
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



            
      const result = rows.map(row => {
            let parsedDetalles = [];
            try {
                // Algunos drivers devuelven objeto, otros string, otros null
                if (row.detalles) {
                    parsedDetalles = typeof row.detalles === 'string' 
                        ? JSON.parse(row.detalles) 
                        : row.detalles;
                }
            } catch (e) {
                console.error("Error parseando detalles:", e);
            }

            return {
                ...row,
                detalles: parsedDetalles
            };
        });

        res.json(result);
    } catch (error) { 
        console.error("Error SQL detallado:", error);
        res.status(500).json({ 
            message: "Error al obtener facturas", 
            error: error.sqlMessage || error.message 
        }); 
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

            // REDONDEO FINAL PARA SQL
            const subtotalR = Math.round(subtotal);
            const ivaR = Math.round(iva);
            const totalR = Math.round(total);

            const [lastRecord] = await connection.query("SELECT MAX(id) AS lastId FROM facturas");
            const nextId = (lastRecord[0].lastId || 0) + 1;
            const numFactura = `FAC-${nextId.toString().padStart(4, '0')}`;

            const [facturaResult] = await connection.query(
                "INSERT INTO facturas (numero_factura, cliente_id, fecha_emision, subtotal, iva, total, tipo_pago, estado) VALUES (?, ?, ?, ?, ?, ?, ?, 'Pendiente')",
                [numFactura, cliente_id, fecha_emision, subtotalR, ivaR, totalR, tipo_pago]
            );

            const facturaId = facturaResult.insertId;

            if (detalles && detalles.length > 0) {
                for (const item of detalles) {
                    if (item.producto_id) {
                        const subLinea = Math.round(item.total);
                        const totalLineaIva = Math.round(subLinea * 1.19);

                        await connection.query(
                            "INSERT INTO factura_detalles (factura_id, producto_id, cantidad, precio_unitario, subtotal, total) VALUES (?, ?, ?, ?, ?, ?)",
                            [facturaId, item.producto_id, item.cant, item.unit, subLinea, totalLineaIva]
                        );
                    }
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
    }
};

export default invoiceController;