// Backend/middleware/auth.middleware.js

import jwt from 'jsonwebtoken'; 
import dotenv from 'dotenv'; // Asegúrate de importar dotenv si no lo has hecho

dotenv.config();

// CRÍTICO: Exportamos la función con el nombre "authenticate"
export const authenticate = (req, res, next) => { 
    // 1. Obtener el token de los headers
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Asegúrate de que process.env.JWT_SECRET esté cargado
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        req.user = decoded; 
        next(); 

    } catch (err) {
    console.log("--- FALLO DE AUTENTICACIÓN PRODUCTOS ---"); // 🚨 NUEVA LÍNEA
        console.error("Error al verificar token:", err.message); // 🚨 NUEVA LÍNEA
        return res.status(403).json({ message: 'Token inválido o expirado.' });
    }
};
