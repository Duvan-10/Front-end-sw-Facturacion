// Backend/middleware/auth.middleware.js

// Importa JWT si lo usas para decodificar
import jwt from 'jsonwebtoken'; 

export const verifyToken = (req, res, next) => {
    // 1. Obtener el token de los headers
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // Si no hay token, enviamos un error 401 y detenemos el flujo.
        return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' });
    }

    const token = authHeader.split(' ')[1]; // Extrae el token (después de "Bearer ")

    try {
        // 2. Verificar el token (usa tu JWT_SECRET del .env)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Adjuntar la información del usuario a la petición (útil para la auditoría)
        req.userId = decoded.id; 
        
        // 4. CRÍTICO: Si el token es válido, llamamos a next() para pasar al controlador.
        next(); 

    } catch (err) {
        // Si el token es inválido o expiró
        return res.status(403).json({ message: 'Token inválido o expirado.' });
    }
};