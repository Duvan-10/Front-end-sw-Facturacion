import db from '../models/db.js'; 

const invoiceController = {
    // 1. OBTENER TODAS LAS FACTURAS (Tu código original)
    getAllInvoices: async (req, res) => {
        try {
            const query = `
                SELECT 
                    f.id AS id_real,
                    f.numero_factura AS id, 
                    c.nombre_razon_social AS client,
                    f.fecha_emision AS date,
                    f.total,
                    f.tipo_pago AS tipoFactura,
                    f.estado AS status
                FROM facturas f
                JOIN clientes c ON f.cliente_id = c.id
                ORDER BY 
                    CASE WHEN f.estado = 'Pendiente' THEN 1 ELSE 2 END, 
                    f.fecha_emision DESC;
            `;
            const [rows] = await db.query(query);
            res.json(rows);
        } catch (error) {
            console.error("Error en getAllInvoices:", error);
            res.status(500).json({ message: "Error al obtener facturas" });
        }
    },

    // 2. GENERAR PRÓXIMO NÚMERO (Para el formulario)
    getNextNumber: async (req, res) => {
        try {
            const [rows] = await db.query("SELECT MAX(id) AS lastId FROM facturas");
            const nextId = (rows[0].lastId || 0) + 1;
            const formatted = `FAC-${nextId.toString().padStart(4, '0')}`;
            res.json({ numero_factura: formatted });
        } catch (error) {
            res.status(500).json({ message: "Error al generar número" });
        }
    },

    // 3. CREAR FACTURA (Lógica de guardado y stock)
    createInvoice: async (req, res) => {
        const connection = await db.getConnection(); // Para asegurar que todo se guarde o nada se guarde
        try {
            await connection.beginTransaction();

            const { cliente_id, tipo_pago, fecha_emision, subtotal, iva, total, detalles } = req.body;

            // A. Insertar cabecera de factura
            // Primero generamos el número basado en el ID que vendrá
            const [lastRecord] = await connection.query("SELECT MAX(id) AS lastId FROM facturas");
            const nextId = (lastRecord[0].lastId || 0) + 1;
            const numFactura = `FAC-${nextId.toString().padStart(4, '0')}`;

            const [facturaResult] = await connection.query(
            "INSERT INTO facturas (numero_factura, cliente_id, fecha_emision, subtotal, iva, total, tipo_pago, estado) VALUES (?, ?, ?, ?, ?, ?, ?, 'Pendiente')",
            [numFactura, cliente_id, fecha_emision, subtotal, iva, total, tipo_pago]
              );

            const facturaId = facturaResult.insertId;

            // B. Insertar los productos (detalles) y actualizar inventario
            for (const item of detalles) {
                if (!item.producto_id) continue;

                // Guardar en factura_detalles
                await connection.query(
                    "INSERT INTO factura_detalles (factura_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)",
                    [facturaId, item.producto_id, item.cant, item.unit, item.total]
                );


            }

            await connection.commit();
            res.status(201).json({ message: "Factura creada", numero_factura: numFactura });

        } catch (error) {
            await connection.rollback();
            console.error("Error en createInvoice:", error);
            res.status(500).json({ message: "Error al procesar la factura en el servidor" });
        } finally {
            connection.release();
        }
    }
};

export default invoiceController;