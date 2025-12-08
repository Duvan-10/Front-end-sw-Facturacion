// Backend/server.js (VERSIÓN ACTUALIZADA)

// 1. Importar dotenv y configurarlo CON LA RUTA CORRECTA
import * as dotenv from 'dotenv';
dotenv.config({ path: './Backend/.env' }); 

// 2. Importar el resto de librerías
import express from 'express';
import cors from 'cors';
import { testConnection } from './models/db.js';
import authRoutes from './routes/auth.routes.js'; 

// 🚨 1. IMPORTAR LA NUEVA RUTA DE CLIENTES
import clienteRoutes from './routes/cliente.routes.js'; 


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Conexión de prueba a la base de datos
testConnection(); 

// Rutas
app.use('/api/auth', authRoutes);

// 🚨 2. INTEGRAR LA RUTA DE CLIENTES
app.use('/api/clientes', clienteRoutes);


app.get('/', (req, res) => {
res.send('API de PFEPS funcionando!');
});

// Iniciar el servidor
app.listen(PORT, () => {
console.log(`🚀 Servidor Express escuchando en http://localhost:${PORT}`);
});