/**
 * ============================================================
 * CONTROLADOR DE FACTURAS
 * Archivo: Backend/controllers/invoice.controller.js
 * PROPÓSITO:
 *  - Gestionar operaciones CRUD de facturas
 *  - Obtener listados y detalles de facturas
 *  - Crear, actualizar y eliminar facturas
 *  - Manejar cambios de estado de facturas
 *  - Emitir facturas por email con PDF adjunto
 * ============================================================
 */

import db from '../models/db.js'; 
import { sendInvoiceEmail } from '../config/email.config.js'; 

const invoiceController = {
    // 1. OBTENER TODAS LAS FACTURAS
    getAllInvoices: async (req, res) => {
        try {
            const query = `
                SELECT f.id AS id_real, f.numero_factura AS id, c.nombre_razon_social AS client,
                c.identificacion, c.email, f.fecha_emision AS date, f.total, f.estado AS status, f.fecha_vencimiento,
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
                       f.subtotal, f.iva, f.total, f.fecha_vencimiento,
                       c.identificacion, c.nombre_razon_social, c.telefono, c.direccion, c.email
                FROM facturas f
                JOIN clientes c ON f.cliente_id = c.id
                WHERE f.id = ?`, [id]);

            if (facturaRows.length === 0) return res.status(404).json({ message: "No encontrada" });

            const f = facturaRows[0];
            const [detallesRows] = await db.query(`
                SELECT fd.producto_id, p.codigo AS code, fd.cantidad AS cant, 
                       CONCAT(p.nombre, ' - ', p.descripcion) AS detail, fd.precio_unitario AS unit,
                       fd.descuento, fd.total AS total
                FROM factura_detalles fd
                JOIN productos p ON fd.producto_id = p.id
                WHERE fd.factura_id = ?`, [id]);

            res.json({
                numero_factura: f.numero_factura,
                fecha_emision: f.fecha_emision,
                estado: f.estado,
                fecha_vencimiento: f.fecha_vencimiento,
                subtotal: f.subtotal,
                iva: f.iva,
                total: f.total,
                cliente: {
                    id: f.cliente_id, identificacion: f.identificacion, 
                    nombre_razon_social: f.nombre_razon_social, telefono: f.telefono, 
                    direccion: f.direccion, email: f.email
                },
                detalles: detallesRows
            });
        } catch (error) { res.status(500).json({ message: "Error al cargar factura" }); }
    },

    // 3. CREAR FACTURA
    createInvoice: async (req, res) => {
        const connection = await db.getConnection();
        try {
            const { cliente_id, fecha_vencimiento, fecha_emision, subtotal, iva, total, productos } = req.body;
            
            // --- VALIDACIÓN DE CLIENTE ---
            if (!cliente_id) {
                return res.status(404).json({ error: "CLIENTE_NO_EXISTE", message: "El cliente no está registrado." });
            }

            // --- VALIDACIÓN DE FECHA VENCIMIENTO ---
            if (!fecha_vencimiento) {
                return res.status(400).json({ 
                    error: "FECHA_VENCIMIENTO_REQUERIDA", 
                    message: "Debe especificar la fecha de vencimiento." 
                });
            }

            await connection.beginTransaction();
            
            const [lastRecord] = await connection.query("SELECT MAX(id) AS lastId FROM facturas");
            const nextId = (lastRecord[0].lastId || 0) + 1;
            const numFactura = `FAC-${nextId.toString().padStart(4, '0')}`;
            
            // Estado inicial siempre es Pendiente
            const estadoFinal = 'Pendiente';

            const [result] = await connection.query(
                "INSERT INTO facturas (numero_factura, cliente_id, fecha_emision, fecha_vencimiento, subtotal, iva, total, estado) VALUES (?,?,?,?,?,?,?,?)",
                [numFactura, cliente_id, fecha_emision || new Date(), fecha_vencimiento, subtotal, iva, total, estadoFinal]
            );

            for (const item of productos) {
                await connection.query(
                    "INSERT INTO factura_detalles (factura_id, producto_id, cantidad, precio_unitario, descuento, subtotal, total) VALUES (?,?,?,?,?,?,?)",
                    [result.insertId, item.producto_id, item.cantidad, item.precio, item.descuento || 0, item.subtotal || (item.cantidad * item.precio), item.subtotal || (item.cantidad * item.precio)]
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

    // 4. ACTUALIZAR FACTURA
    updateInvoice: async (req, res) => {
        const connection = await db.getConnection();
        try {
            const { id } = req.params;
            const { cliente_id, fecha_vencimiento, fecha_emision, subtotal, iva, total, productos } = req.body;
            
            // Validar que la factura existe
            const [facturaExistente] = await connection.query("SELECT id FROM facturas WHERE id = ?", [id]);
            if (facturaExistente.length === 0) {
                return res.status(404).json({ message: "Factura no encontrada" });
            }

            // Validación de cliente
            if (!cliente_id) {
                return res.status(400).json({ error: "CLIENTE_NO_EXISTE", message: "El cliente no está registrado." });
            }

            await connection.beginTransaction();
            
            // Actualizar factura
            await connection.query(
                "UPDATE facturas SET cliente_id = ?, fecha_emision = ?, fecha_vencimiento = ?, subtotal = ?, iva = ?, total = ? WHERE id = ?",
                [cliente_id, fecha_emision || new Date(), fecha_vencimiento, subtotal, iva, total, id]
            );

            // Eliminar detalles antiguos
            await connection.query("DELETE FROM factura_detalles WHERE factura_id = ?", [id]);

            // Insertar nuevos detalles
            if (productos && productos.length > 0) {
                for (const item of productos) {
                    await connection.query(
                        "INSERT INTO factura_detalles (factura_id, producto_id, cantidad, precio_unitario, descuento, subtotal, total) VALUES (?,?,?,?,?,?,?)",
                        [id, item.producto_id, item.cantidad, item.precio, item.descuento || 0, item.subtotal || (item.cantidad * item.precio), item.subtotal || (item.cantidad * item.precio)]
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
    ,
    // 7. ELIMINAR FACTURA (SOLO ADMIN)
    deleteInvoice: async (req, res) => {
        const connection = await db.getConnection();
        try {
            const { id } = req.params;

            // 1. Validar que el solicitante sea admin
            const [userRows] = await connection.query('SELECT role FROM users WHERE id = ?', [req.user.id]);
            if (!userRows.length || userRows[0].role !== 'admin') {
                return res.status(403).json({ message: 'Acceso denegado. Solo administradores pueden eliminar facturas.' });
            }

            await connection.beginTransaction();

            // 2. Verificar existencia
            const [facturaRows] = await connection.query('SELECT id FROM facturas WHERE id = ?', [id]);
            if (!facturaRows.length) {
                await connection.rollback();
                return res.status(404).json({ message: 'Factura no encontrada.' });
            }

            // 3. Eliminar detalles y factura
            await connection.query('DELETE FROM factura_detalles WHERE factura_id = ?', [id]);
            await connection.query('DELETE FROM facturas WHERE id = ?', [id]);

            await connection.commit();
            return res.status(200).json({ message: 'Factura eliminada correctamente.' });
        } catch (error) {
            if (connection) await connection.rollback();
            console.error('Error al eliminar factura:', error);
            res.status(500).json({ message: 'Error interno del servidor.' });
        } finally {
            connection.release();
        }
    },

    // 8. EMITIR FACTURA (Enviar por email)
    emitInvoice: async (req, res) => {
        try {
            const { id } = req.params;
            const { clientEmail, numeroFactura } = req.body;

            // Obtener datos completos de la factura
            const [facturaRows] = await db.query(`
                SELECT f.id, f.numero_factura, f.estado, f.fecha_vencimiento, f.fecha_emision,
                       f.subtotal, f.iva, f.total, f.cliente_id,
                       c.nombre_razon_social, c.email, c.identificacion, c.telefono, c.direccion
                FROM facturas f
                JOIN clientes c ON f.cliente_id = c.id
                WHERE f.id = ?`, [id]);

            if (facturaRows.length === 0) {
                return res.status(404).json({ error: "Factura no encontrada" });
            }

            const factura = facturaRows[0];

            // Validar estado
            if (factura.estado === 'Anulada') {
                return res.status(400).json({ 
                    error: "FACTURA_ANULADA",
                    message: "No se puede emitir una factura anulada" 
                });
            }

            // Validar si está vencida
            if (factura.fecha_vencimiento && factura.estado !== 'Pagada' && factura.estado !== 'Anulada') {
                const today = new Date();
                const vencimiento = new Date(factura.fecha_vencimiento);
                if (vencimiento < today) {
                    return res.status(400).json({ 
                        error: "FACTURA_VENCIDA",
                        message: "No se puede emitir una factura vencida" 
                    });
                }
            }

            // Obtener detalles de la factura
            const [detallesRows] = await db.query(`
                SELECT fd.producto_id, p.codigo AS code, fd.cantidad AS cant, 
                       CONCAT(p.nombre, ' - ', p.descripcion) AS detail, fd.precio_unitario AS unit,
                       fd.descuento, fd.total AS total
                FROM factura_detalles fd
                JOIN productos p ON fd.producto_id = p.id
                WHERE fd.factura_id = ?`, [id]);

            // Obtener datos del emisor
            const [emisorRows] = await db.query('SELECT * FROM perfil_emisor LIMIT 1');
            const emisorData = emisorRows.length > 0 ? emisorRows[0] : null;

            // Preparar datos para el email
            const facturaData = {
                numero_factura: factura.numero_factura,
                fecha_emision: factura.fecha_emision,
                estado: factura.estado,
                fecha_vencimiento: factura.fecha_vencimiento,
                subtotal: factura.subtotal,
                iva: factura.iva,
                total: factura.total,
                cliente: {
                    id: factura.cliente_id,
                    identificacion: factura.identificacion,
                    nombre_razon_social: factura.nombre_razon_social,
                    telefono: factura.telefono,
                    direccion: factura.direccion,
                    email: factura.email
                },
                detalles: detallesRows
            };

            // Enviar email con PDF adjunto
            await sendInvoiceEmail(facturaData, emisorData, clientEmail);

            console.log(`✅ Factura ${factura.numero_factura} emitida y enviada a ${clientEmail}`);

            res.json({ 
                success: true, 
                message: "Factura emitida y enviada al correo del cliente correctamente",
                numeroFactura: factura.numero_factura,
                cliente: factura.nombre_razon_social,
                email: clientEmail
            });
        } catch (error) {
            console.error("Error al emitir factura:", error);
            res.status(500).json({ error: "Error al emitir factura", message: error.message });
        }
    }
}
export default invoiceController;