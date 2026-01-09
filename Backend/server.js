import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import os from 'os';
import { testConnection } from './models/db.js';

// Importación de Rutas
import authRoutes from './routes/auth.routes.js'; 
import clienteRoutes from './routes/cliente.routes.js'; 
import productoRoutes from './routes/producto.routes.js';
import invoiceRoutes from './routes/invoiceRoutes.js'; 
import perfilRoutes from './routes/perfil.routes.js';
import userRoutes from './routes/user.routes.js';



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0'; // Escucha en todas las interfaces

app.use(cors()); 
app.use(express.json()); 

testConnection(); 

app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api', perfilRoutes);
app.use('/api/facturas', invoiceRoutes);
app.use('/api/users', userRoutes);
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => res.status(204).end());


app.get('/', (req, res) => {
    res.json({ message: 'API de Facturación funcionando! 🚀' });
});

app.listen(PORT, HOST, async () => {
    console.log(`🚀 SERVIDOR ACTIVO EN PUERTO: ${PORT}`);
    console.log(`🌐 Accesible desde cualquier dispositivo en la red`);
    console.log(`📍 Local: http://localhost:${PORT}`);
    
    // Mostrar IP de red si está disponible
    const osModule = await import('os');
    const networkInterfaces = osModule.default.networkInterfaces();
    const addresses = [];
    
    Object.keys(networkInterfaces).forEach((interfaceName) => {
        networkInterfaces[interfaceName].forEach((iface) => {
            if (iface.family === 'IPv4' && !iface.internal) {
                addresses.push(iface.address);
            }
        });
    });
    
    if (addresses.length > 0) {
        console.log(`📱 Red: http://${addresses[0]}:${PORT}`);
    }
    console.log(`🚀 SERVIDOR ACTIVO EN PUERTO: ${PORT}`);
});