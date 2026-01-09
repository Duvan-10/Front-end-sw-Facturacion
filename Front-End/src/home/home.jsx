/**
 * ============================================================
 * COMPONENTE PRINCIPAL DEL DASHBOARD (HOME)
 * Archivo: home.jsx
 * RESPONSABILIDAD:
 *  - Mostrar la vista principal del sistema una vez autenticado.
 *  - Renderizar el menú lateral (Sidebar) y los widgets principales.
 *  - Manejar todas las rutas internas del sistema.
 * ============================================================
 */
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import '../styles/home.css';
import { 
  FaUserCog, 
  FaHome, 
  FaFileInvoiceDollar, 
  FaUsers, 
  FaBox, 
  FaChartLine, 
  FaUserCircle,
  FaSignOutAlt
} from 'react-icons/fa';

// Importar módulos
import Facturas from '../modules/Facturas/Facturas';
import Clientes from '../modules/Clientes/Clientes';
import Productos from '../modules/Productos/Productos';
import Reportes from '../modules/Reportes/Reportes';
import Perfil from '../modules/Perfil/Perfil';
import GestionUsuarios from '../modules/GestionUsuarios/GestionUsuarios';

const Home = () => {
  const { user, logout } = useAuth();
  
  return (
    <>
      {/* --- SIDEBAR / MENÚ LATERAL --- */}
      <div className="sidebar">
        <h2>{user?.name || 'Usuario'}</h2>
        <div className="user-icon">
          <img src="https://via.placeholder.com/80" alt="Foto del usuario" />
        </div>
        <ul>
          <li>
            <Link to="/home">
              <FaHome /> Dashboard
            </Link>
          </li>
          <li>
            <Link to="/home/facturas">
              <FaFileInvoiceDollar /> Facturas
            </Link>
          </li>
          <li>
            <Link to="/home/clientes">
              <FaUsers /> Clientes
            </Link>
          </li>
          <li>
            <Link to="/home/productos">
              <FaBox /> Productos
            </Link>
          </li>
          <li>
            <Link to="/home/reportes">
              <FaChartLine /> Reportes
            </Link>
          </li>
          <li>
            <Link to="/home/perfil">
              <FaUserCircle /> Perfil
            </Link>
          </li>
          {user?.role === 'admin' && (
            <li>
              <Link to="/home/usuarios">
                <FaUserCog /> Gestión de Usuarios
              </Link>
            </li>
          )}
          <li onClick={logout} style={{ marginTop: '20px', borderTop: '1px solid var(--color-input-background)', paddingTop: '15px' }}>
            <a style={{ cursor: 'pointer' }}>
              <FaSignOutAlt /> Cerrar Sesión
            </a>
          </li>
        </ul>
      </div>

      {/* --- CONTENIDO PRINCIPAL (MAIN) --- */}
      <div className="main-content">
        <Routes>
          <Route index element={<DashboardHome />} />
          <Route path="facturas" element={<Facturas />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="productos" element={<Productos />} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="perfil" element={<Perfil />} />
          <Route path="usuarios" element={<GestionUsuarios />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </div>
    </>
  );
};

// Componente para el dashboard principal
const DashboardHome = () => {
  return (
    <>
      <div className="header">
        <h1>Bienvenido al sistema de Facturación Electrónica</h1>
      </div>

      <div className="cards">
        <div className="card">
          <h3>Facturas recientes</h3>
          <p>Consulta las últimas facturas emitidas.</p>
        </div>
        <div className="card">
          <h3>Clientes</h3>
          <p>Administra tu base de clientes fácilmente.</p>
        </div>
        <div className="card">
          <h3>Reportes</h3>
          <p>Genera reportes detallados de tus ventas.</p>
        </div>
      </div>
    </>
  );
};

export default Home;
