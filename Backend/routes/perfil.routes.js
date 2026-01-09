import express from 'express'; // Cambiado de require a import
import db from '../config/db.config.js'; // Cambiado de require a import (agrega .js al final)

const router = express.Router();

// Endpoint para obtener los datos de perfil_emisor
router.get('/emisor', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM perfil_emisor LIMIT 1');
        if (rows.length === 0) {
            return res.status(404).json({ message: "No hay datos" });
        }
        // Enviamos el primer objeto directamente
        res.json(rows[0]); 
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router; // Cambiado de module.exports a export default