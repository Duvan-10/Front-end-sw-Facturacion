import express from 'express';
const router = express.Router();
import db from '../config/db.config.js'; // Asegúrate de que termine en .js

router.get('/perfil-emisor', async (req, res) => {
    try {
        // Consulta exacta según tu tabla perfil_emisor
        const [rows] = await db.query('SELECT * FROM perfil_emisor LIMIT 1');
        
        if (rows.length === 0) {
            return res.status(404).json({ message: "No hay datos del emisor" });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error en el servidor" });
    }
});

// Cambia module.exports por export default
export default router;