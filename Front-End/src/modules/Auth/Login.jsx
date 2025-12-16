// ruta: Front-end-sw-Facturacion/Front-end/src/modules/Auth/Login.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './styles.css'; 
import logo from '../../assets/logo.png'; 

function Login() {
  const navigate = useNavigate(); 
  
  // 1. Estados de Formulario y Sesión
  // ... (otros estados)

  // Gestión de la Sesión
  const [user, setUser] = useState(null); 
  // 🚨 CORRECCIÓN 1: Usar 'authToken' para que Productos.jsx lo encuentre
  const [token, setToken] = useState(localStorage.getItem('authToken')); 

  // -------------------------------------------------------------------
  // Lógica de Gestión de Sesión (usando localStorage)
  // ...

  const handleLogout = () => {
    // 🚨 CORRECCIÓN 2: Usar 'authToken'
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setStatusMessage('Sesión cerrada correctamente.');
  };
  
  // ... (handleRegister omitido por brevedad, no hay cambios)

  // -------------------------------------------------------------------
  // FUNCIÓN DE LOGIN
  // -------------------------------------------------------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage('');

    if (!email || !password) {
        setStatusMessage('Ingresa correo y contraseña.');
        setIsLoading(false);
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            // Guardar token y datos del usuario
            // 🚨 CORRECCIÓN 3: Usar 'authToken' al guardar
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setToken(data.token);
            setUser(data.user);
            setStatusMessage(`🎉 Login Exitoso. Redirigiendo a Home...`);

            // NAVEGACIÓN DIRECTA A HOME
            navigate('/home', { replace: true }); 

        } else {
            setStatusMessage(`❌ Login Fallido: ${data.message || 'Credenciales incorrectas.'}`);
        }
    } catch (error) {
        setStatusMessage('⚠️ Error de conexión con el servidor. Asegúrate de que Express esté corriendo.');
    } finally {
        setIsLoading(false);
    }
  };

  // ... (resto del componente es correcto)
}

export default Login;