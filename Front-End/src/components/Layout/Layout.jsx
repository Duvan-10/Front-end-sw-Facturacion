// Front-end/src/components/Layout/Layout.jsx

import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

function Layout() {
    const { user, logout } = useAuth();
    
    const handleLogout = () => {
        logout();
    };

    return (
        <>
            <header className="app-header">
                PFEps - Software de Facturación Electrónica
            </header>

            {/* Menú de navegación PERSISTENTE */}
            <nav className="navbar">
                
                {/* Contenedor para centrar los links */}
                <div className="navbar-center-container"> 
                    <ul className="navbar-links">
                        <li><Link to="/home" className="nav-link">Inicio</Link></li>
                        <li><Link to="/home/facturas" className="nav-link">Facturas</Link></li>
                        <li><Link to="/home/clientes" className="nav-link">Clientes</Link></li>
                        <li><Link to="/home/productos" className="nav-link">Productos</Link></li>
                        <li><Link to="/home/reportes" className="nav-link">Reportes</Link></li>
                        <li><Link to="/home/perfil" className="nav-link">Perfil</Link></li>
                        {user?.role === 'admin' && (
                            <li><Link to="/home/usuarios" className="nav-link" style={{ color: '#dc3545' }}>👤 Usuarios</Link></li>
                        )}
                    </ul>
                </div>

                {/* BOTÓN DE LOGOUT */}
                <button
                    onClick={handleLogout}
                    className="btn-logout"
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
