// Front-end/src/App.jsx (CON RUTA DE PRUEBA PDF)

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { API_URL } from './api'; // Importamos la configuración local del Frontend
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

// 1. Importaciones de componentes
import ThemeSwitch from './components/ThemeSwitch.jsx';
import WelcomePage from './Auth/WelcomePage';
import Register from './Auth/Register';
import Login from './Auth/Login';
import Layout from './components/Layout/Layout.jsx'; 
import Home from './view/Home.jsx';   

// Componentes de Módulos
import Facturas from './modules/Facturas/Facturas.jsx'; 
import Clientes from './modules/Clientes/Clientes.jsx'; 
import Productos from './modules/Productos/Productos.jsx';
import Perfil from './modules/Perfil/Perfil.jsx';
import Reportes from './modules/Reportes/Reportes.jsx';
import GestionUsuarios from './modules/GestionUsuarios/GestionUsuarios.jsx';

// Componentes de Formularios
import InvoiceForm from './components/InvoiceForm/InvoiceForm';
import ClientForm from './components/ClientForm/ClientForm'; 
import ProductForm from './components/ProductForm/ProductForm'; 

// 2. IMPORTACIÓN DEL TEST (Asegúrate de haber creado este archivo)
import TestPDF from './components/TestPDF.jsx';

import "./styles/global.css";

function App() {
    const [hasUsers, setHasUsers] = useState(null); // null = cargando, true/false = resultado
    const [loading, setLoading] = useState(true);

    // Verificar si existen usuarios al iniciar la app
    useEffect(() => {
        const checkUsers = async () => {
            try {
                const response = await fetch(`${API_URL}/auth/has-users`);
                const data = await response.json();
                setHasUsers(data.hasUsers);
            } catch (error) {
                console.error('Error al verificar usuarios:', error);
                setHasUsers(false); // Si falla, asumir que no hay usuarios
            } finally {
                setLoading(false);
            }
        };
        checkUsers();
    }, []);

    // Mostrar pantalla de carga mientras verifica
    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <h2>Cargando...</h2>
            </div>
        );
    }

    return (
        <BrowserRouter>
            <ThemeProvider>
                <AuthProvider>
                    <ThemeSwitch />
                    <Routes>
                
                {/* 1. Ruta Raíz - Redirige según si hay usuarios o no */}
                <Route 
                    path="/" 
                    element={hasUsers ? <Navigate to="/login" replace /> : <Navigate to="/welcome" replace />} 
                />

                {/* 2. Ruta de Bienvenida (cuando no hay usuarios) */}
                <Route path="/welcome" element={hasUsers ? <Navigate to="/login" replace /> : <WelcomePage />} />

                {/* 3. Rutas de Autenticación */}
                <Route path="/register" element={hasUsers ? <Navigate to="/login" replace /> : <Register />} />
                <Route path="/login" element={<Login />} />
                
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


                {/* 4. Rutas Protegidas con Layout (Menú, Sidebar, etc.) */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/home" element={<Layout />}> 
                        <Route index element={<Home />} /> 
                        <Route path="clientes" element={<Clientes />} />
                        <Route path="facturas" element={<Facturas />} /> 
                        <Route path="productos" element={<Productos />} />
                        <Route path="reportes" element={<Reportes />} />
                        <Route path="perfil" element={<Perfil />} />
                        <Route path="usuarios" element={<GestionUsuarios />} />
                    </Route>
                </Route>

                {/* 5. Ruta 404 */}
                <Route path="*" element={<h1>404 | Página no encontrada</h1>} />

            </Routes>
            </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
}

export default App;