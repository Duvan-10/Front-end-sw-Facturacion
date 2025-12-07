// ruta: Front-end-sw-Facturacion/Front-end/src/modules/Auth/Login.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 🚨 CORRECTO
import './styles.css'; 
import logo from '../../assets/logo.png'; 

function Login() {
  // Inicializar el hook de navegación aquí (SÓLO UNA VEZ)
  const navigate = useNavigate(); 
  
  // 1. Estados de Formulario y Sesión
  const [name, setName] = useState(''); 
  const [identification, setIdentification] = useState(''); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Estados de control de la UI/Sesión
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [statusMessage, setStatusMessage] = useState(''); 
  const [isLoading, setIsLoading] = useState(false);
  
  // Gestión de la Sesión
  const [user, setUser] = useState(null); 
  const [token, setToken] = useState(localStorage.getItem('token')); 

  // -------------------------------------------------------------------
  // Lógica de Gestión de Sesión (usando localStorage)
  useEffect(() => {
    // Si hay un token guardado, recuperamos los datos del usuario...
    if (token) {
        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            setUser(storedUser);
            // 🚨 REDIRECCIÓN A HOME
            navigate('/home', { replace: true }); 
        } catch (e) {
            // Manejo de error si el JSON está mal
            handleLogout();
        }
    } else {
        setUser(null);
    }
  }, [token, navigate]); // 🚨 SINTAXIS CORREGIDA

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setStatusMessage('Sesión cerrada correctamente.');
  };
  
  // Alternar entre Login y Registro
  const toggleMode = (mode) => {
    setIsRegistering(mode);
    setStatusMessage('');
    // Limpiar campos al alternar
    setName('');
    setIdentification('');
    setEmail('');
    setPassword('');
  };

  // -------------------------------------------------------------------
  // FUNCIÓN DE REGISTRO
  // -------------------------------------------------------------------
  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage('');

    if (!name || !identification || !email || !password) {
        setStatusMessage('Todos los campos son obligatorios.');
        setIsLoading(false);
        return;
    }
    
    const userData = { name, identification, email, password };

    try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (response.ok) {
            setStatusMessage(`🎉 Registro exitoso. ¡Ya puedes iniciar sesión!`);
            toggleMode(false); // Cambiar a vista de Login
        } else {
            // Mensaje de error (ej: cédula o email duplicado)
            setStatusMessage(`❌ Error: ${data.message || 'Error al registrar.'}`);
        }

    } catch (error) {
        setStatusMessage('⚠️ Error de conexión con el servidor. Asegúrate de que Express esté corriendo.');
    } finally {
        setIsLoading(false);
    }
  };

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
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setToken(data.token);
            setUser(data.user);
            setStatusMessage(`🎉 Login Exitoso. Redirigiendo a Home...`);

            // 🚨 NAVEGACIÓN DIRECTA A HOME
            navigate('/home', { replace: true }); 

        } else {
            // 🚨 CORREGIDO: Manejo de error para respuesta no OK
            setStatusMessage(`❌ Login Fallido: ${data.message || 'Credenciales incorrectas.'}`);
        }
        
    } catch (error) {
        setStatusMessage('⚠️ Error de conexión con el servidor. Asegúrate de que Express esté corriendo.');
    } finally {
        setIsLoading(false);
    }
  };


  const handleSubmit = isRegistering ? handleRegister : handleLogin;
  
  // Textos dinámicos
  const titleText = isRegistering ? 'Crear una nueva cuenta' : 'Accede a tu cuenta';
  const buttonText = isRegistering ? (isLoading ? 'Guardando...' : 'Completar Registro') : (isLoading ? 'Iniciando...' : 'Iniciar sesión');

  // -------------------------------------------------------------------
  // VISTA DE FORMULARIO (Login/Registro) - El bloque if(user) fue eliminado.
  // -------------------------------------------------------------------
  return (
    <main className="auth">
      <section className="auth-card" aria-labelledby="auth-title">

        <header className="auth-header">
          <img src={logo} alt="PFEPS Logo" className="brand-logo" /> 
          <h1 id="auth-title">PFEPS</h1>
          <p className="subtitle">{titleText}</p>
          <p className="tagline">Software de Facturación Electrónica</p>
        </header>

        <form onSubmit={handleSubmit}>
          
          {/* Campo de Nombre (Solo en Registro) */}
          {isRegistering && (
            <div className="field">
                <label htmlFor="name">Nombre Completo</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Ej. Juan Pérez"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>
          )}

          {/* Campo de Identificación (Solo en Registro) */}
          {isRegistering && (
            <div className="field">
                <label htmlFor="identification">Identificación (Cédula)</label>
                <input
                    type="text"
                    id="identification"
                    name="identification"
                    placeholder="Tu número de cédula"
                    value={identification}
                    onChange={(e) => setIdentification(e.target.value)}
                    required
                />
                <small className="help">Este campo es obligatorio y único.</small>
            </div>
          )}

          {/* Campo de Email */}
          <div className="field">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Usa tu correo registrado"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Campo de Contraseña */}
          <div className="field">
            <div className="label-row">
              <label htmlFor="password">Contraseña</label>
              <button
                type="button"
                className="link-button" 
                onClick={() => setShowPassword(prev => !prev)}
                aria-controls="password"
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Fila de Checkbox y Olvidé Contraseña (Solo en Login) */}
          {!isRegistering && (
            <div className="form-row">
              <label className="checkbox">
                <input
                  type="checkbox"
                  name="remember"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                <span>Recordarme</span>
              </label>
              <a href="#" className="link">Olvidé mi contraseña</a>
            </div>
          )}

          {/* Acciones del Formulario */}
          <div className="form-actions">
            <button type="submit" className="btn primary" disabled={isLoading}>
              {buttonText}
            </button>
          </div>
          
          {/* Enlace para alternar entre Login y Register */}
          <div className="register-wrapper">
            <p className="subtitle">
              {isRegistering ? (
                <>¿Ya tienes una cuenta? <button type="button" className="link" onClick={() => toggleMode(false)}>Iniciar sesión</button></>
              ) : (
                <>¿No tienes una cuenta? <button type="button" className="link register-link" onClick={() => toggleMode(true)}>Regístrate</button></>
              )}
            </p>
          </div>

          {/* Mensaje de estado */}
          {statusMessage && <p className="status" role="status" aria-live="polite">{statusMessage}</p>}
        </form>

      </section>
    </main>
  );
}

export default Login;