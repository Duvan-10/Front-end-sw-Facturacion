// 1. Configuración de Entorno (Debe ir al principio)
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener la ruta del directorio actual de forma segura para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Busca el .env en la misma carpeta donde vive este archivo server.js
dotenv.config({ path: path.resolve(__dirname, '.env') });

// 2. Importación de librerías
import express from 'express';
import cors from 'cors';
import { testConnection } from './models/db.js';
import authRoutes from './routes/auth.routes.js'; 
import clienteRoutes from './routes/cliente.routes.js'; 
import productoRoutes from './routes/producto.routes.js';

const app = express();

// 3. Configuración de Puerto Dinámico
const PORT = process.env.PORT || 8080; 

// 4. Middlewares Globales
app.use(cors()); 
app.use(express.json()); // Vital para leer el cuerpo (body) de las peticiones POST/PUT

// 5. Verificación de Conexión a DB al arrancar
testConnection(); 

// 6. Definición de Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/productos', productoRoutes);

// Ruta base de cortesía
app.get('/', (req, res) => {
    res.json({ 
        message: 'API de Facturación funcionando correctamente! 🚀',
        estado: 'Online',
        version: '1.0.0'
    });
});

// 7. Lanzamiento del Servidor
app.listen(PORT, () => {
    console.log(`============================================`);
    console.log(`🚀 SERVIDOR ACTIVO`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`📂 DB: ${process.env.DB_NAME || 'No definida'}`);
    console.log(`============================================`);
});