// Front-end/src/components/Layout/Layout.jsx

import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom'; 
import './styles.css';

function Layout() {
    const navigate = useNavigate();
    
    // FUNCIÓN DE CERRAR SESIÓN
    const handleLogout = () => {
        // Limpiar el almacenamiento local
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirigir al formulario de Login (Ruta '/')
        navigate('/', { replace: true }); 
    };

    return (
        <>
            <nav className="navbar navbar-logout">
                
                {/* BOTÓN DE LOGOUT */}
                <button 
                    onClick={handleLogout} 
                    className="btn-logout"
                >
                    Cerrar Sesión
                </button>
            </nav>
            
            {/* 3. CONTENIDO DINÁMICO (Usará estilos de <main> en index.css) */}
            <main>
                <Outlet />
            </main>
        </>
    );
}

export default Layout;