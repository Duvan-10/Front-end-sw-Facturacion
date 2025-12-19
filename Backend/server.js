import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import { testConnection } from './models/db.js';

// Importación de Rutas
import authRoutes from './routes/auth.routes.js'; 
import clienteRoutes from './routes/cliente.routes.js'; 
import productoRoutes from './routes/producto.routes.js';
import invoiceRoutes from './routes/invoiceRoutes.js'; 
import perfilRoutes from './routes/perfil.routes.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 8080; 

app.use(cors()); 
app.use(express.json()); 

testConnection(); 

app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/facturas', invoiceRoutes);
app.use('/api', perfilRoutes);
app.use('/api', perfilRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'API de Facturación funcionando! 🚀' });
});

app.listen(PORT, () => {
    console.log(`🚀 SERVIDOR ACTIVO EN PUERTO: ${PORT}`);
});