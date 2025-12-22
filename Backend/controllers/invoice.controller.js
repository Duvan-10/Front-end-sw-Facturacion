import db from '../models/db.js'; 

const invoiceController = {
    // 1. OBTENER TODAS LAS FACTURAS
    getAllInvoices: async (req, res) => {
        try {
            const query = `
                SELECT f.id AS id_real, f.numero_factura AS id, c.nombre_razon_social AS client,
                f.fecha_emision AS date, f.total, f.pago AS pagado, f.estado AS status,
                (SELECT COALESCE(JSON_ARRAYAGG(JSON_OBJECT('producto_nombre', p.nombre, 'cantidad', fd.cantidad)), JSON_ARRAY())
                 FROM factura_detalles fd JOIN productos p ON fd.producto_id = p.id WHERE fd.factura_id = f.id) AS detalles
                FROM facturas f JOIN clientes c ON f.cliente_id = c.id ORDER BY f.fecha_emision DESC;`;
            const [rows] = await db.query(query);
            const result = rows.map(row => ({
                ...row,
                detalles: typeof row.detalles === 'string' ? JSON.parse(row.detalles) : row.detalles
            }));
            res.json(result);
        } catch (error) { res.status(500).json({ message: "Error", error: error.message }); }
    },

    // 2. OBTENER UNA FACTURA POR ID (CORREGIDO PARA CARGAR PRODUCTOS Y EMAIL)
    getInvoiceById: async (req, res) => {
        try {
            const { id } = req.params;
            const [facturaRows] = await db.query(`
                SELECT f.id, f.numero_factura, f.fecha_emision, f.pago AS pagado, f.cliente_id,
                       c.identificacion, c.nombre_razon_social, c.telefono, c.direccion, c.email
                FROM facturas f
                JOIN clientes c ON f.cliente_id = c.id
                WHERE f.id = ?`, [id]);

            if (facturaRows.length === 0) return res.status(404).json({ message: "No encontrada" });

            const f = facturaRows[0];
            const [detallesRows] = await db.query(`
                SELECT fd.producto_id, p.codigo AS code, fd.cantidad AS cant, 
                       p.nombre AS detail, fd.precio_unitario AS unit,
                       (fd.cantidad * fd.precio_unitario) AS total
                FROM factura_detalles fd
                JOIN productos p ON fd.producto_id = p.id
                WHERE fd.factura_id = ?`, [id]);

            res.json({
                numero_factura: f.numero_factura,
                fecha_emision: f.fecha_emision,
                pagado: f.pagado, 
                cliente: {
                    id: f.cliente_id, identificacion: f.identificacion, 
                    nombre_razon_social: f.nombre_razon_social, telefono: f.telefono, 
                    direccion: f.direccion, email: f.email
                },
                detalles: detallesRows // Estructura idéntica al estado del frontend
            });
        } catch (error) { res.status(500).json({ message: "Error al cargar factura" }); }
    },

    // 3. CREAR / 4. ACTUALIZAR (Lógica simplificada)
    createInvoice: async (req, res) => {
        const connection = await db.getConnection();
        try {
            const { cliente_id, pagado, fecha_emision, subtotal, iva, total, detalles } = req.body;
            await connection.beginTransaction();
            const [lastRecord] = await connection.query("SELECT MAX(id) AS lastId FROM facturas");
            const nextId = (lastRecord[0].lastId || 0) + 1;
            const numFactura = `FAC-${nextId.toString().padStart(4, '0')}`;
            const [result] = await connection.query(
                "INSERT INTO facturas (numero_factura, cliente_id, fecha_emision, subtotal, iva, total, pago, estado) VALUES (?,?,?,?,?,?,?,?)",
                [numFactura, cliente_id, fecha_emision, subtotal, iva, total, pagado, pagado === 'Si' ? 'Pagada' : 'Pendiente']
            );
            for (const item of detalles) {
                await connection.query("INSERT INTO factura_detalles (factura_id, producto_id, cantidad, precio_unitario, subtotal, total) VALUES (?,?,?,?,?,?)",
                [result.insertId, item.producto_id, item.cant, item.unit, item.total, item.total * 1.19]);
            }
            await connection.commit();
            res.status(201).json({ success: true });
        } catch (e) { await connection.rollback(); res.status(500).json({ message: "Error" }); } finally { connection.release(); }
    },

    updateInvoice: async (req, res) => {
        const connection = await db.getConnection();
        try {
            const { id } = req.params;
            const { cliente_id, pagado, fecha_emision, subtotal, iva, total, detalles } = req.body;
            await connection.beginTransaction();
            await connection.query("UPDATE facturas SET cliente_id=?, pago=?, fecha_emision=?, subtotal=?, iva=?, total=?, estado=? WHERE id=?",
                [cliente_id, pagado, fecha_emision, subtotal, iva, total, pagado === 'Si' ? 'Pagada' : 'Pendiente', id]);
            await connection.query("DELETE FROM factura_detalles WHERE factura_id=?", [id]);
            for (const item of detalles) {
                await connection.query("INSERT INTO factura_detalles (factura_id, producto_id, cantidad, precio_unitario, subtotal, total) VALUES (?,?,?,?,?,?)",
                [id, item.producto_id, item.cant, item.unit, item.total, item.total * 1.19]);
            }
            await connection.commit();
            res.json({ success: true });
        } catch (e) { await connection.rollback(); res.status(500).json({ message: "Error" }); } finally { connection.release(); }
    },

    getNextNumber: async (req, res) => {
        const [rows] = await db.query("SELECT MAX(id) AS lastId FROM facturas");
        res.json({ numero_factura: `FAC-${((rows[0].lastId || 0) + 1).toString().padStart(4, '0')}` });
    },
 

    //BUSCAR PRODUCTOS
    searchProducts: async (req, res) => {
    const searchTerm = req.query.q || ''; 
    const [rows] = await db.query("SELECT id, codigo, nombre, precio FROM productos WHERE codigo LIKE ? OR nombre LIKE ? LIMIT 10", [`%${searchTerm}%`, `%${searchTerm}%`]);
    res.json(rows);}
}
export default invoiceController;