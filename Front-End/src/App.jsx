// Front-end/src/App.jsx (VERSIÓN FINAL CON RUTAS DE PRODUCTOS)

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 1. Importaciones de componentes
import Login from './modules/Auth/Login.jsx'; 
import Layout from './components/Layout/Layout.jsx'; 
import Home from './view/Home.jsx';   

// Componentes de Módulos (Listados que están dentro del Layout)
import Facturas from './modules/Facturas/Facturas.jsx'; 
import Clientes from './modules/Clientes/Clientes.jsx'; 
import Productos from './modules/Productos/Productos.jsx';
import Perfil from './modules/Perfil/Perfil.jsx';
import Reportes from './modules/Reportes/Reportes.jsx';

// Componentes de Formularios (rutas absolutas, sin Layout)
import InvoiceForm from './components/InvoiceForm/InvoiceForm';
import ClientForm from './components/ClientForm/ClientForm'; 
// ->>>>> 🟢 NUEVA IMPORTACIÓN DE PRODUCTOS 🟢 <<<<<---------------------------------
import ProductForm from './components/ProductForm/ProductForm'; 

import "./styles/global.css";


function App() {
    return (
        <BrowserRouter>
            <Routes>
                
                {/* 1. Ruta de Autenticación */}
                <Route path="/" element={<Login />} />
                
                {/* ======================================================= */}
                {/* 2. RUTAS INDEPENDIENTES (Pestañas Separadas) */}
                {/* ======================================================= */}
                
                {/* Rutas de Facturas */}
                <Route path="/facturas/crear" element={<InvoiceForm />} />
                <Route path="/facturas/editar/:id" element={<InvoiceForm />} />

                {/* Rutas de Clientes */}
                <Route path="/clientes/crear" element={<ClientForm />} />
                <Route path="/clientes/editar/:id" element={<ClientForm />} />

                {/* ->>>>> 🟢 NUEVAS RUTAS DE PRODUCTOS 🟢 <<<<<------------------ */}
                <Route path="/productos/crear" element={<ProductForm />} />
                <Route path="/productos/editar/:id" element={<ProductForm />} />
                {/* ------------------------------------------------------------ */}


                {/* 3. Rutas con Layout (Menú, Sidebar, etc.) */}
                <Route path="/home" element={<Layout />}> 

                    <Route index element={<Home />} /> 

                    {/* Rutas Hijas (dentro del layout) */}
                    <Route path="clientes" element={<Clientes />} />
                    <Route path="facturas" element={<Facturas />} /> 
                    <Route path="productos" element={<Productos />} />
                    <Route path="reportes" element={<Reportes />} />
                    <Route path="perfil" element={<Perfil />} />
                    
                </Route>

                {/* 4. Ruta 404 */}
                <Route path="*" element={<h1>404 | Página no encontrada</h1>} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;