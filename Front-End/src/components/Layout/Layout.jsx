// Front-end/src/components/Layout/Layout.jsx

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

 {/* Contenedor para centrar los links */}
<div className="navbar-center-container"> 
 <ul className="navbar-links">
 <li><Link to="/home" className="nav-link">Dashboard</Link></li>
<li><Link to="/home/facturas" className="nav-link">Facturas</Link></li>
 <li><Link to="/home/clientes" className="nav-link">Clientes</Link></li>
 <li><Link to="/home/productos" className="nav-link">Productos</Link></li>
 <li><Link to="/home/reportes" className="nav-link">Reportes</Link></li>
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
 {/* El contenido del módulo (Outlet) se carga aquí */}
 <Outlet />
 </main>
 </>
 );
}

export default Layout;