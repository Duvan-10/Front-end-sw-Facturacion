/**
 * ============================================================
 * RUTA PROTEGIDA POR AUTENTICACIÓN
 * Archivo: ProtectedRoute.jsx
 * RESPONSABILIDAD:
 *  - Verificar si existe un usuario autenticado en AuthContext.
 *  - Renderizar las rutas hijas (Outlet) solo si hay sesión.
 *  - Redirigir a /login cuando el usuario no está autenticado.
 * ============================================================
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
    const { user } = useAuth();

    // Si hay un usuario (está logueado), permite el paso (Outlet).
    // Si NO hay usuario, lo redirige al formulario de inicio de sesión.
    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;