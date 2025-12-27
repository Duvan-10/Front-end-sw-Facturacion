const db = require('../config/db'); // Tu conexión a MySQL

const getPerfilEmisor = async (req, res) => {
    try {
        // Consultamos el registro único de la empresa
        const [rows] = await db.query('SELECT * FROM perfil_emisor LIMIT 1');
        
        if (rows.length === 0) {
            return res.status(404).json({ message: "No se encontraron datos del emisor" });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error("Error en DB:", error);
        res.status(500).json({ error: "Error al conectar con la tabla perfil_emisor" });
    }
};

module.exports = { getPerfilEmisor };