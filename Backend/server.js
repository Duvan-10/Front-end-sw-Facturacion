// Backend/server.js (CORRECCIÓN DE PUERTO Y RUTAS)

// 1. Importar dotenv y configurarlo CON LA RUTA CORRECTA
import * as dotenv from 'dotenv';
dotenv.config({ path: './Backend/.env' }); 

// 2. Importar el resto de librerías
import express from 'express';
import cors from 'cors';
import { testConnection } from './models/db.js';
import authRoutes from './routes/auth.routes.js'; 
import clienteRoutes from './routes/cliente.routes.js'; 
import productoRoutes from './routes/producto.routes.js';


const app = express();
const PORT = process.env.PORT || 8080; // Usaremos 8080 por defecto si .env no lo define. 


app.use(cors()); 
app.use(express.json());


// Conexión de prueba a la base de datos
testConnection(); 

// =======================================================
// RUTAS DE LA API
// =======================================================


app.use('/api/auth', authRoutes);

// 🚨 INTEGRAR LA RUTA DE CLIENTES
app.use('/api/clientes', clienteRoutes);

// 🚨 INTEGRAR LA RUTA DE PRODUCTOS
app.use('/api/productos', productoRoutes);

// 🚨 ELIMINAR app.use('/api/auth', authRoutes); duplicado.


app.get('/', (req, res) => {
    res.send('API de PFEPS funcionando!');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor Express escuchando en http://localhost:${PORT}`);
});