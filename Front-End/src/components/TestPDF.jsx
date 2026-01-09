/**
 * ============================================================
 * PANTALLA DE INICIO DE SESIÓN
 * Archivo: Login.jsx
 * RESPONSABILIDAD:
 *  - Mostrar el formulario de autenticación y selector de rol.
 *  - Validar datos antes de llamar al AuthContext.
 *  - Redirigir al usuario autenticado hacia /home.
 * ============================================================
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import '../styles/Registro_Login.css';

function Login() {
    // ========================================================
    // 1. HOOKS Y ESTADOS
    // ========================================================
    
    const navigate = useNavigate();
    const { login, isLoading, statusMessage, setStatusMessage, isAuthenticated } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [selectedRole, setSelectedRole] = useState('Usuario'); // Rol por defecto

    // ========================================================
    // 2. EFECTOS SECUNDARIOS
    // ========================================================

    // Efecto para redirigir si el usuario ya está autenticado
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/home', { replace: true }); // Redirección principal tras login
        }
    }, [isAuthenticated, navigate]);

    // Efecto para limpiar el mensaje de estado al cargar o desmontar el componente
    useEffect(() => {
        return () => {
            if (setStatusMessage) setStatusMessage({ type: null, message: '' });
        };
    }, [setStatusMessage]);

    // ========================================================
    // 3. MANEJADORES Y LÓGICA DE VALIDACIÓN
    // ========================================================

    // Helper para determinar el color del mensaje según el tipo
    const getStatusClass = (type) => {
        if (type === 'error') return 'error-message';
        if (type === 'success') return 'success-message';
        return 'info-message'; // Para mensajes informativos (ej. onboarding)
    };

    // Función para validar los campos antes del envío
    const validateForm = () => {
        const newErrors = {};
        if (!email.trim()) {
            newErrors.email = 'El correo electrónico es obligatorio.';
        }
        if (!password) {
            newErrors.password = 'La contraseña es obligatoria.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Manejador del envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (setStatusMessage) setStatusMessage({ type: null, message: '' });

        if (!validateForm()) {
            setStatusMessage({ type: 'error', message: 'Por favor, completa todos los campos.' });
            return;
        }

        try {
            // Se pasa el rol seleccionado a la función de login
            const success = await login({ email, password, role: selectedRole });
            if (success) {
                navigate('/home', { replace: true });
            }
            // El AuthContext se encarga de gestionar el mensaje de error si 'success' es false
        } catch (error) {
            console.error("Fallo inesperado durante el login:", error);
            if (setStatusMessage) {
                setStatusMessage({ type: 'error', message: 'Ocurrió un error inesperado al iniciar sesión.' });
            }
        }
    };

    // ==========================================================
    // 4. ESTRUCTURA DEL COMPONENTE (RENDERIZADO)
    // ==========================================================
    return (
        <main className="auth-login">
            <section className="auth-card" aria-labelledby="auth-title">
                {/* Encabezado */}
                <header className="auth-header">
                    <img src={logo} alt="PFEPS Logo" className="brand-logo" />
                    <h1 id="auth-title">PFEPS</h1>
                    <p className="tagline">Software de Facturación Electrónica</p>
                </header>

                {/* Mensajes de estado (errores/éxito) */}
                {statusMessage.message && (
                    <p className={`status ${getStatusClass(statusMessage.type)}`} role="status" aria-live="polite">
                        {statusMessage.message}
                    </p>
                )}

                {/* Selector de Roles */}
                <div className="role-selector-container">
                    <p className="role-selector-title">Iniciar sesión como:</p>
                    <div className="role-options">
                        <button
                            type="button"
                            className={`role-option ${selectedRole === 'Administrador' ? 'selected' : ''}`}
                            onClick={() => setSelectedRole('Administrador')}
                        >
                            Administrador
                        </button>
                        <button
                            type="button"
                            className={`role-option ${selectedRole === 'Usuario' ? 'selected' : ''}`}
                            onClick={() => setSelectedRole('Usuario')}
                        >
                            Usuario
                        </button>
                    </div>
                </div>

                {/* Formulario de Login */}

                <form onSubmit={handleSubmit}>
                    {/* Campo de Email */}

                    <div className="field">

                    

                         <label htmlFor="email">Correo electrónico</label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="tu.correo@ejemplo.com"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (errors.email) setErrors(p => ({...p, email: null}));
                            }}
                            className={errors.email ? 'input-error' : ''}
                          />
                          {errors.email && <p className="help error">{errors.email}</p>}
            </div>
                 


                    {/* Campo de Contraseña */}
                    <div className="field">
                        
                        <div className="label-mostrar">
                            <label htmlFor="password">Contraseña</label>
                           
                            <button
                                type="button"
                                className="link-button"
                                onClick={() => setShowPassword(prev => !prev)}
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
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (errors.password) setErrors(p => ({...p, password: null}));
                            }}
                            className={errors.password ? 'input-error' : ''}
                        />
                        {errors.password && <p className="help error">{errors.password}</p>}
                    </div>


                    {/* Opciones Recordarme-Recuperar Contraseña */}
                    <div className="Options-row">

                        <div className="remember-me">
                        
                        <input
                                type="checkbox"
                                id="rememberMe"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <label htmlFor="rememberMe">Recordarme</label>
                        </div>
                        <Link to="/forgot-password" tabIndex="0" className="link-button">Recuperar contraseña</Link>
                    </div>



                    {/* Botón de Envío */}
                    <div className="form-actions">
                        <button
                            type="submit"
                            className="btn primary"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
                        </button>
                    </div>
                </form>
            </section>
        </main>
    );
}

export default Login;