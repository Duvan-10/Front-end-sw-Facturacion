import express from 'express';
import db from '../config/db.config.js';

const router = express.Router();

// Obtener una factura completa por su ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // 1. Obtener encabezado de factura y datos del cliente
        const [factura] = await db.query(`
            SELECT f.*, c.nombre_razon_social, c.identificacion, c.direccion, c.telefono 
            FROM facturas f
            JOIN clientes c ON f.cliente_id = c.id
            WHERE f.id = ?`, [id]);

        if (factura.length === 0) {
            return res.status(404).json({ message: "Factura no encontrada" });
        }

        // 2. Obtener los detalles (productos) de esa factura
        const [detalles] = await db.query(`
            SELECT * FROM factura_detalles WHERE factura_id = ?`, [id]);

        // 3. Unificar la respuesta
        const respuesta = {
            ...factura[0],
            detalles: detalles // Aquí van los productos
        };

        res.json(respuesta);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener la factura" });
    }
});

export default router;