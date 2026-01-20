/**
 * ============================================================
 * ENRUTADOR PRINCIPAL DE LA APLICACIÓN
 * Archivo: App.jsx
 * RESPONSABILIDAD:
 *  - Definir las rutas públicas principales (Welcome, Login, Register).
 *  - Consultar al backend si el sistema ya tiene usuarios creados.
 *  - Proteger rutas privadas (Home) verificando el token.
 *  - Gestionar la navegación global.
 * ============================================================
 */

import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import WelcomePage from './auth/WelcomePage';
import Login from './auth/Login';
import Register from './auth/Register';
import ForgotPassword from './auth/ForgotPassword';
import ResetPassword from './auth/ResetPassword';
import ThemeSwitch from './components/ThemeSwitch'; 
import ProtectedRoute from './components/ProtectedRoute';
import { API_URL } from './api'; // Importamos la configuración local del Frontend

// Importar componente protegido
import Home from './home/home';
import Invoicenewclient from './forms/Invoicenewclient';
import InvoiceForm from './forms/InvoiceForm';

// --- CONTEXTO GLOBAL PARA VERIFICACIÓN DE USUARIOS ---
// Almacena el estado de si existen usuarios en el sistema
export const SystemContext = React.createContext(null);

// --- COMPONENTE GUARD (ROOT) ---
// Se monta cada vez que se visita la ruta "/"
// asegurando que siempre se verifique el estado actual de la BD.
const RootGuard = ({ hasUsers }) => {
    if (hasUsers === null) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--color-background-dark)', color: 'var(--color-text-light)' }}>
                Cargando sistema...
            </div>
        );
    }

    return hasUsers ? <Navigate to="/login" replace /> : <WelcomePage />;
};

// --- COMPONENTE PROTECTOR DE REGISTRO ---
// Solo permite acceso a /register si NO existen usuarios en el sistema
const RegisterGuard = ({ hasUsers, children }) => {
    if (hasUsers === null) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--color-background-dark)', color: 'var(--color-text-light)' }}>
                Cargando sistema...
            </div>
        );
    }

    // Si existen usuarios, no se permite acceder al registro
    if (hasUsers) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

function App() {
    const [hasUsers, setHasUsers] = useState(null);

    useEffect(() => {
        // LOG DE PRUEBA: Muestra en la consola a dónde se está conectando
        console.log("📡 Conectando a la API en:", API_URL);

        const checkSystem = async () => {
            try {
                const res = await fetch(`${API_URL}/auth/has-users`);
                const data = await res.json();
                setHasUsers(data.hasUsers);
            } catch (error) {
                console.error("Error verificando sistema:", error);
                // En caso de error, asumimos false para no bloquear la app
                setHasUsers(false);
            }
        };
        checkSystem();
    }, []);

    return (
        <>
            <ThemeSwitch /> 

            <Routes>
                {/* PÁGINA DE BIENVENIDA (ruta inicial) */}
                {/* Usamos RootGuard para que la validación ocurra al entrar a esta ruta */}
                <Route path="/" element={<RootGuard hasUsers={hasUsers} />} />

                {/* RUTA DE REGISTRO - Protegida para solo permitir cuando NO existen usuarios */}
                <Route 
                    path="/register" 
                    element={
                        <RegisterGuard hasUsers={hasUsers}>
                            <Register />
                        </RegisterGuard>
                    } 
                />

                {/* RUTAS DE AUTENTICACIÓN (Públicas) */}
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* RUTAS PROTEGIDAS (requieren autenticación) */}
                <Route path="/home/*" element={<ProtectedRoute />}>
                    <Route path="facturas/crear-nuevo-cliente" element={<Invoicenewclient />} />
                    <Route path="facturas/crear" element={<InvoiceForm />} />
                    <Route path="*" element={<Home />} />
                </Route>

                {/* RUTA POR DEFECTO - Redirige al login si no hay ruta */}
                <Route path="*" element={<Navigate to="/login" replace />} />

            </Routes>
        </>
    );
}

export default App;