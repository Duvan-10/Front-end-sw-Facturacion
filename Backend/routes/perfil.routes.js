import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import {
    getUserProfile,
    updateUserProfile,
    changePassword,
    uploadProfilePhoto
} from '../controllers/perfilController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configurar multer para subir fotos de perfil
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Guardar en Front-End/src/Pictures/Profile
        const uploadDir = path.join(__dirname, '../../Front-End/src/Pictures/Profile');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no permitido. Solo se aceptan imágenes (JPG, PNG, GIF)'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// (Legacy eliminado) Perfil emisor ya no se usa; el perfil viene de tabla users

// Nuevas rutas para perfil de usuario
router.get('/me', authMiddleware, getUserProfile);
router.put('/me', authMiddleware, updateUserProfile);
router.put('/change-password', authMiddleware, changePassword);
router.post('/upload-photo', authMiddleware, upload.single('photo'), uploadProfilePhoto);

export default router;