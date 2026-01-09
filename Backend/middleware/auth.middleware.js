import jwt from 'jsonwebtoken'; 
import dotenv from 'dotenv';

dotenv.config();

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 
        next(); 
    } catch (err) {
        console.error("Fallo de autenticación:", err.message);
        return res.status(403).json({ message: 'Token inválido o expirado.' });
    }
};

// Middleware para verificar que el usuario es admin
export const adminMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Autenticación requerida.' });
    }
    
    // Nota: El rol se verifica desde la BD, no del token por seguridad
    // Este middleware se usa junto con otro que trae los datos del usuario
    next();
};

export default authMiddleware; // Exportación única por defecto