// ruta: Backend/routes/user.routes.js

import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import { createNewUser, getAllUsers, updateUser, deleteUser } from '../controllers/user.controller.js';

const router = express.Router();

// POST /api/users - Crear nuevo usuario (solo admin)
router.post('/', authMiddleware, createNewUser);

// GET /api/users - Listar todos los usuarios (solo admin)
router.get('/', authMiddleware, getAllUsers);

// PUT /api/users/:id - Actualizar usuario (solo admin)
router.put('/:id', authMiddleware, updateUser);

// DELETE /api/users/:id - Eliminar usuario (solo admin)
router.delete('/:id', authMiddleware, deleteUser);

export default router;
