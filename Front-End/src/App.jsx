// Front-end/src/App.jsx (CON RUTA DE PRUEBA PDF)

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 1. Importaciones de componentes
import Login from './modules/Auth/Login.jsx'; 
import Layout from './components/Layout/Layout.jsx'; 
import Home from './view/Home.jsx';   

// Componentes de Módulos
import Facturas from './modules/Facturas/Facturas.jsx'; 
import Clientes from './modules/Clientes/Clientes.jsx'; 
import Productos from './modules/Productos/Productos.jsx';
import Perfil from './modules/Perfil/Perfil.jsx';
import Reportes from './modules/Reportes/Reportes.jsx';

// Componentes de Formularios
import InvoiceForm from './components/InvoiceForm/InvoiceForm';
import ClientForm from './components/ClientForm/ClientForm'; 
import ProductForm from './components/ProductForm/ProductForm'; 

// 2. IMPORTACIÓN DEL TEST (Asegúrate de haber creado este archivo)
import TestPDF from './components/TestPDF.jsx';

import "./styles/global.css";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                
                {/* 1. Ruta de Autenticación */}
                <Route path="/" element={<Login />} />
                
                {/* ======================================================= */}
                {/* 2. RUTA DE PRUEBA TÉCNICA (Temporal) */}
                {/* Escribe http://localhost:5173/test-pdf para probar el diseño */}
                <Route path="/test-pdf" element={<TestPDF />} />
                {/* ======================================================= */}

                {/* 3. RUTAS INDEPENDIENTES */}
                <Route path="/facturas/crear" element={<InvoiceForm />} />
                <Route path="/facturas/editar/:id" element={<InvoiceForm />} />

                <Route path="/clientes/crear" element={<ClientForm />} />
                <Route path="/clientes/editar/:id" element={<ClientForm />} />

                <Route path="/productos/crear" element={<ProductForm />} />
                <Route path="/productos/editar/:id" element={<ProductForm />} />


                {/* 4. Rutas con Layout (Menú, Sidebar, etc.) */}
                <Route path="/home" element={<Layout />}> 
                    <Route index element={<Home />} /> 
                    <Route path="clientes" element={<Clientes />} />
                    <Route path="facturas" element={<Facturas />} /> 
                    <Route path="productos" element={<Productos />} />
                    <Route path="reportes" element={<Reportes />} />
                    <Route path="perfil" element={<Perfil />} />
                </Route>

                {/* 5. Ruta 404 */}
                <Route path="*" element={<h1>404 | Página no encontrada</h1>} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;