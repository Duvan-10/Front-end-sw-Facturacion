import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import { 
  getReportesByTipo, 
  generarReporte, 
  getDatosReporte 
} from '../controllers/reportes.controller.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// GET /api/reportes?tipo=facturas - Obtener historial de reportes por tipo
router.get('/', getReportesByTipo);

// POST /api/reportes/generar - Generar y guardar nuevo reporte
router.post('/generar', generarReporte);

// GET /api/reportes/:id/datos - Obtener datos del reporte para descarga
router.get('/:id/datos', getDatosReporte);

export default router;
