import db from '../models/db.js'; 

const invoiceController = {
    // 1. OBTENER TODAS LAS FACTURAS
    getAllInvoices: async (req, res) => {
        try {
            const query = `
                SELECT f.id AS id_real, f.numero_factura AS id, c.nombre_razon_social AS client,
                f.fecha_emision AS date, f.total, f.estado AS status,
                (SELECT COALESCE(JSON_ARRAYAGG(JSON_OBJECT('producto_nombre', p.nombre, 'cantidad', fd.cantidad)), JSON_ARRAY())
                 FROM factura_detalles fd JOIN productos p ON fd.producto_id = p.id WHERE fd.factura_id = f.id) AS detalles
                FROM facturas f JOIN clientes c ON f.cliente_id = c.id ORDER BY f.fecha_emision DESC;`;
            const [rows] = await db.query(query);
            const result = rows.map(row => ({
                ...row,
                detalles: typeof row.detalles === 'string' ? JSON.parse(row.detalles) : row.detalles
            }));
            res.json(result);
        } catch (error) { 
            console.error("Error en getAll:", error);
            res.status(500).json({ message: "Error", error: error.message }); 
        }
    },

    // 2. OBTENER UNA FACTURA POR ID
    getInvoiceById: async (req, res) => {
        try {
            const { id } = req.params;
            const [facturaRows] = await db.query(`
                SELECT f.id, f.numero_factura, f.fecha_emision, f.estado, f.cliente_id,
                       c.identificacion, c.nombre_razon_social, c.telefono, c.direccion, c.email
                FROM facturas f
                JOIN clientes c ON f.cliente_id = c.id
                WHERE f.id = ?`, [id]);

            if (facturaRows.length === 0) return res.status(404).json({ message: "No encontrada" });

            const f = facturaRows[0];
            const [detallesRows] = await db.query(`
                SELECT fd.producto_id, p.codigo AS code, fd.cantidad AS cant, 
                       p.nombre AS detail, fd.precio_unitario AS unit,
                       fd.total AS total
                FROM factura_detalles fd
                JOIN productos p ON fd.producto_id = p.id
                WHERE fd.factura_id = ?`, [id]);

            res.json({
                numero_factura: f.numero_factura,
                fecha_emision: f.fecha_emision,
                estado: f.estado, 
                cliente: {
                    id: f.cliente_id, identificacion: f.identificacion, 
                    nombre_razon_social: f.nombre_razon_social, telefono: f.telefono, 
                    direccion: f.direccion, email: f.email
                },
                detalles: detallesRows
            });
        } catch (error) { res.status(500).json({ message: "Error al cargar factura" }); }
    },

    // 3. CREAR FACTURA (Seguridad de Pago Restaurada)
    createInvoice: async (req, res) => {
        const connection = await db.getConnection();
        try {
            const { cliente_id, pago, fecha_emision, subtotal, iva, total, productos } = req.body;
            
            // --- VALIDACIÓN DE CLIENTE ---
            if (!cliente_id) {
                return res.status(404).json({ error: "CLIENTE_NO_EXISTE", message: "El cliente no está registrado." });
            }

            // --- SEGURIDAD: VALIDACIÓN DE ESTADO DE PAGO ---
            // Si el pago viene como 'Default' o vacío, rechazamos la petición
            if (!pago || pago === 'Default') {
                return res.status(400).json({ 
                    error: "PAGO_REQUERIDO", 
                    message: "⚠️ Seguridad: Debe seleccionar si la factura está pagada (Si/No)." 
                });
            }

            await connection.beginTransaction();
            
            const [lastRecord] = await connection.query("SELECT MAX(id) AS lastId FROM facturas");
            const nextId = (lastRecord[0].lastId || 0) + 1;
            const numFactura = `FAC-${nextId.toString().padStart(4, '0')}`;
            
            // Mapeamos el valor de seguridad 'pago' a la columna 'estado'
            const estadoFinal = (pago === 'Si') ? 'Pagada' : 'Pendiente';

            const [result] = await connection.query(
                "INSERT INTO facturas (numero_factura, cliente_id, fecha_emision, subtotal, iva, total, estado) VALUES (?,?,?,?,?,?,?)",
                [numFactura, cliente_id, fecha_emision || new Date(), subtotal, iva, total, estadoFinal]
            );

            for (const item of productos) {
                await connection.query(
                    "INSERT INTO factura_detalles (factura_id, producto_id, cantidad, precio_unitario, subtotal, total) VALUES (?,?,?,?,?,?)",
                    [result.insertId, item.producto_id, item.cantidad, item.vUnitario, item.vTotal, item.vTotal]
                );
            }

            await connection.commit();
            res.status(201).json({ success: true, message: "Factura creada", id: result.insertId, numero: numFactura });
        } catch (e) { 
            if (connection) await connection.rollback(); 
            console.error("Error en Create:", e);
            res.status(500).json({ error: "Error interno", message: e.message }); 
        } finally { 
            connection.release(); 
        }
    },

    // 4. PRÓXIMO NÚMERO
    getNextNumber: async (req, res) => {
        try {
            const [rows] = await db.query("SELECT IFNULL(MAX(id), 0) + 1 AS lastId FROM facturas");
            const nextId = rows[0].lastId;
            res.json({ numero: `FAC-${nextId.toString().padStart(4, '0')}` });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // 5. BUSCAR PRODUCTOS
    searchProducts: async (req, res) => {
        const searchTerm = req.query.q || ''; 
        const [rows] = await db.query("SELECT id, codigo, nombre, descripcion, precio, impuesto_porcentaje FROM productos WHERE codigo LIKE ? OR nombre LIKE ? LIMIT 10", [`%${searchTerm}%`, `%${searchTerm}%`]);
        res.json(rows);
    },

    // 6. ACTUALIZAR FACTURA
    updateInvoice: async (req, res) => {
        const connection = await db.getConnection();
        try {
            const { id } = req.params;
            const { cliente_id, pago, fecha_emision, subtotal, iva, total, productos } = req.body;
            
            // Validar que la factura existe
            const [facturaExistente] = await connection.query("SELECT id FROM facturas WHERE id = ?", [id]);
            if (facturaExistente.length === 0) {
                return res.status(404).json({ message: "Factura no encontrada" });
            }

            // Validación de cliente
            if (!cliente_id) {
                return res.status(400).json({ error: "CLIENTE_NO_EXISTE", message: "El cliente no está registrado." });
            }

            // Validación de estado de pago
            if (!pago || pago === 'Default') {
                return res.status(400).json({ 
                    error: "PAGO_REQUERIDO", 
                    message: "⚠️ Seguridad: Debe seleccionar si la factura está pagada (Si/No)." 
                });
            }

            await connection.beginTransaction();
            
            const estadoFinal = (pago === 'Si') ? 'Pagada' : 'Pendiente';

            // Actualizar factura
            await connection.query(
                "UPDATE facturas SET cliente_id = ?, fecha_emision = ?, subtotal = ?, iva = ?, total = ?, estado = ? WHERE id = ?",
                [cliente_id, fecha_emision || new Date(), subtotal, iva, total, estadoFinal, id]
            );

            // Eliminar detalles antiguos
            await connection.query("DELETE FROM factura_detalles WHERE factura_id = ?", [id]);

            // Insertar nuevos detalles
            if (productos && productos.length > 0) {
                for (const item of productos) {
                    await connection.query(
                        "INSERT INTO factura_detalles (factura_id, producto_id, cantidad, precio_unitario, subtotal, total) VALUES (?,?,?,?,?,?)",
                        [id, item.producto_id, item.cantidad, item.vUnitario, item.vTotal, item.vTotal]
                    );
                }
            }

            await connection.commit();
            res.status(200).json({ success: true, message: "Factura actualizada", id: id });
        } catch (e) { 
            if (connection) await connection.rollback(); 
            console.error("Error en Update:", e);
            res.status(500).json({ error: "Error interno", message: e.message }); 
        } finally { 
            connection.release(); 
        }
    }
}
export default invoiceController;