// CORRECCIÓN: Usamos la ruta que ya funciona en tu server.js
import  db  from '../models/db.js'; 

const invoiceController = {
    getAllInvoices: async (req, res) => {
        try {
            const query = `
                SELECT 
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
            // IMPORTANTE: Asegúrate de que tu archivo db.js exporte una variable llamada 'db' o 'pool'
            const [rows] = await db.query(query);
            res.json(rows);
        } catch (error) {
            console.error("Error en getAllInvoices:", error);
            res.status(500).json({ message: "Error al obtener facturas desde la DB" });
        }
    }
};

export default invoiceController;