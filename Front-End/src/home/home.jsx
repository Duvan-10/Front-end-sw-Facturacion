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
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import '../styles/home.css';
import { 
  FaUserCog, 
  FaHome, 
  FaFileInvoiceDollar, 
  FaUsers, 
  FaBox, 
  FaChartLine, 
  FaUserCircle,
  FaSignOutAlt,
  FaBars,
  FaChevronLeft
} from 'react-icons/fa';

// Importar módulos
import Facturas from '../modules/Facturas';
import Clientes from '../modules/Clientes';
import Productos from '../modules/Productos';
import Reportes from '../modules/Reportes';
import Perfil from '../modules/Perfil';
import GestionUsuarios from '../modules/users';
import InvoiceForm from '../forms/InvoiceForm';
import Invoicenewclient from '../forms/Invoicenewclient';

const Home = () => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Estado para controlar el menú
  const location = useLocation(); // Hook para saber en qué ruta estamos
  const [userData, setUserData] = useState({
    name: user?.name || 'Usuario',
    profile_photo: user?.profile_photo || null
  });

  // Actualizar datos del usuario desde sessionStorage cuando cambian
  useEffect(() => {
    const updateUserData = () => {
      const storedUser = JSON.parse(sessionStorage.getItem('user'));
      if (storedUser) {
        setUserData({
          name: storedUser.name || 'Usuario',
          profile_photo: storedUser.profile_photo || null
        });
      }
    };

    // Actualizar al cargar
    updateUserData();

    // Escuchar evento personalizado cuando se actualiza el perfil
    window.addEventListener('userUpdated', updateUserData);

    return () => {
      window.removeEventListener('userUpdated', updateUserData);
    };
  }, [user]);

  // Función para alternar el menú
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Función auxiliar para verificar si el link está activo
  const isActive = (path) => location.pathname === path ? 'active' : '';
  
  return (
    <>
      {/* Botón para Ocultar/Fijar el menú (Ahora fuera del sidebar para persistir) */}
      <button className={`sidebar-toggle ${isSidebarOpen ? 'open' : 'closed'}`} onClick={toggleSidebar} title={isSidebarOpen ? "Ocultar menú" : "Mostrar menú"}>
        {isSidebarOpen ? <FaChevronLeft /> : <FaBars />}
      </button>

      {/* --- SIDEBAR / MENÚ LATERAL --- */}
      <div className={`sidebar ${isSidebarOpen ? '' : 'collapsed'}`}>

        <h2>{userData.name}</h2>

        <div className="user-icon">
          {userData.profile_photo ? (
            <img 
              src={`http://${window.location.hostname}:8080${userData.profile_photo}`}
              alt="Foto del usuario" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/80?text=Usuario';
              }}
            />
          ) : (
            <img src="https://via.placeholder.com/80?text=Usuario" alt="Foto del usuario" />
          )}
        </div>

        <ul>
          
         {user?.role === 'admin' && (
            <li className={isActive('/home/usuarios')}>
              <Link to="/home/usuarios">
                <FaUserCog /> <span>Gestión de Usuarios</span>
              </Link>
            </li>
          )}

          <li className={isActive('/home')}>
            <Link to="/home">
              <FaHome /> <span>Inicio</span>
            </Link>
          </li>
          
          <li className={isActive('/home/facturas')}>
            <Link to="/home/facturas">
              <FaFileInvoiceDollar /> <span>Facturas</span>
            </Link>
          </li>
          
          <li className={isActive('/home/clientes')}>
            <Link to="/home/clientes">
              <FaUsers /> <span>Clientes</span>
            </Link>
          </li>

          <li className={isActive('/home/productos')}>
            <Link to="/home/productos">
              <FaBox /> <span>Productos</span>
            </Link>
          </li>

          <li className={isActive('/home/reportes')}>
            <Link to="/home/reportes">
              <FaChartLine /> <span>Reportes</span>
            </Link>
          </li>

          <li className={isActive('/home/perfil')}>
            <Link to="/home/perfil">
              <FaUserCircle /> <span>Configuración</span>
            </Link>
          </li>
          
          <li onClick={logout} style={{ marginTop: '20px', borderTop: '1px solid var(--color-input-background)' }}>
            <a style={{ cursor: 'pointer' }}>
              <FaSignOutAlt /> <span>Cerrar Sesión</span>
            </a>
          </li>


        </ul>

      </div>

      {/* --- CONTENIDO PRINCIPAL (MAIN) --- */}
      <div className="main-content">
        <Routes>
          <Route index element={<DashboardHome />} />
          <Route path="facturas/*" element={<FacturasRoute />} />
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
        <h1>Sistema de Facturación Electrónica</h1>
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

// Componente para manejar las rutas anidadas de facturas
const FacturasRoute = () => {
  return (
    <Routes>
      <Route index element={<Facturas />} />
      <Route path="crear" element={<InvoiceFormWrapper />} />
      <Route path="crear-nuevo-cliente" element={<InvoiceNewClientWrapper />} />
    </Routes>
  );
};

// Wrapper para InvoiceForm que maneja los callbacks
const InvoiceFormWrapper = () => {
  const navigate = useNavigate();
  
  const handleFormSuccess = () => {
    navigate('/home/facturas');
  };

  const handleFormCancel = () => {
    navigate('/home/facturas');
  };

  return <InvoiceForm onSuccess={handleFormSuccess} onCancel={handleFormCancel} />;
};

function InvoiceNewClientWrapper() {
  const navigate = useNavigate();
  const handleBackToFacturas = () => navigate('/home/facturas');

  return <Invoicenewclient onCancel={handleBackToFacturas} />;
}

export default Home;
