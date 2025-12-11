// Front-end/src/App.jsx (VERSIÓN CORREGIDA)

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 1. Importaciones de componentes
import Login from './modules/Auth/Login.jsx'; 
import Layout from './components/Layout/Layout.jsx'; 
import Home from './view/Home.jsx';   

// --- CORRECCIÓN 1: Importación consolidada de Facturas ---
// Se importa una sola vez el componente principal de Facturas
import Facturas from './modules/Facturas/Facturas.jsx'; 
// Se importa el formulario (el cual se usará como ruta independiente)
import InvoiceForm from './components/InvoiceForm/InvoiceForm';

// Importaciones restantes de módulos
import Perfil from './modules/Perfil/Perfil.jsx';
import Clientes from './modules/Clientes/Clientes.jsx'; 
import Productos from './modules/Productos/Productos.jsx';
import Reportes from './modules/Reportes/Reportes.jsx';

import "./styles/global.css";


function App() {
    return (
        <BrowserRouter>
            <Routes>
                
                {/* 1. Ruta de Autenticación */}
                <Route path="/" element={<Login />} />
                
                {/* 2. Rutas INDEPENDIENTES (Fuera del Layout) */}
                {/* Estas rutas deben ser accesibles directamente para abrir en pestaña nueva,
                   y NO deben estar anidadas dentro del Layout para un funcionamiento limpio. */}
                <Route path="/facturas/crear" element={<InvoiceForm />} />
                <Route path="/facturas/editar/:id" element={<InvoiceForm />} />

                {/* 3. Rutas con Layout (Menú, Sidebar, etc.) */}
                <Route path="/home" element={<Layout />}> 

                    <Route index element={<Home />} /> 

                    {/* --- CORRECCIÓN 2: Rutas Hijas Únicas y Correctas --- */}
                    {/* El path "facturas" es la ruta del listado. 
                       Al estar dentro del /home, la ruta completa es /home/facturas.
                       Eliminamos la ruta /facturas duplicada fuera de Layout.
                    */}
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