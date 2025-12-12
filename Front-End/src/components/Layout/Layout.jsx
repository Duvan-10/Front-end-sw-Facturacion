// Front-end/src/components/Layout/Layout.jsx

// Front-end/src/components/Layout/Layout.jsx (o donde esté tu Layout)

import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import './styles.css';

function Layout() {
    const navigate = useNavigate();
    
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/', { replace: true }); 
    };

    return (
        <>
            <header className="app-header">
                PFEps - Software de Facturación Electrónica
            </header>

            {/* Menú de navegación PERSISTENTE */}
            <nav className="navbar">
                
                {/* 🚨 ELIMINAMOS EL DIV DE RELLENO DE 150PX */}
                
                {/* Contenedor para centrar los links (Flex-grow: 1 lo centrará) */}
                <div className="navbar-center-container"> 
                    <ul className="navbar-links">
                        <li><Link to="/home" className="nav-link">Inicio</Link></li>
                        <li><Link to="/home/facturas" className="nav-link">Facturas</Link></li>
                        <li><Link to="/home/clientes" className="nav-link">Clientes</Link></li>
                        <li><Link to="/home/productos" className="nav-link">Productos</Link></li>
                        <li><Link to="/home/reportes" className="nav-link">Reportes</Link></li>
                        <li><Link to="/home/perfil" className="nav-link">Perfil</Link></li>
                    </ul>
                </div>

                {/* BOTÓN DE LOGOUT (Se alinea automáticamente a la derecha por space-between) */}
                <button
                    onClick={handleLogout}
                    className="btn-logout"
                    // 🚨 ELIMINAMOS EL ESTILO EN LÍNEA DE ANCHO
                    // style={{ width: '150px' }} 
                >
                    Cerrar Sesión
                </button>
            </nav>

            <main className="main-content">
                <Outlet />
            </main>
        </>
    );
}

export default Layout;