/**
 * ============================================================
 * PANTALLA DE RECUPERACIÓN DE CONTRASEÑA
 * Archivo: ForgotPassword.jsx
 * RESPONSABILIDAD:
 *  - Solicitar el número de identificación del usuario.
 *  - Enviar solicitud al backend para recuperación de contraseña.
 *  - Mostrar mensajes de estado al usuario.
 * ============================================================
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../api';
import logo from '../Pictures/Auth/logo.png';
import '../styles/Registro_Login.css';

function ForgotPassword() {
    // ========================================================
    // 1. HOOKS Y ESTADOS
    // ========================================================
    
    const navigate = useNavigate();
    const [identificacion, setIdentificacion] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ type: null, message: '' });
    const [emailSent, setEmailSent] = useState(false);

    // ========================================================
    // 2. MANEJADORES Y LÓGICA DE VALIDACIÓN
    // ========================================================

    // Helper para determinar el color del mensaje según el tipo
    const getStatusClass = (type) => {
        if (type === 'error') return 'error-message';
        if (type === 'success') return 'success-message';
        return 'info-message';
    };

    // Función para validar el campo de identificación
    const validateForm = () => {
        if (!identificacion.trim()) {
            setStatusMessage({ 
                type: 'error', 
                message: 'El número de identificación es obligatorio.' 
            });
            return false;
        }
        return true;
    };

    // Manejador del envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatusMessage({ type: null, message: '' });

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ identificacion }),
            });

            const data = await response.json();

            if (!response.ok) {
                setStatusMessage({ 
                    type: 'error', 
                    message: data.message || 'Error al procesar la solicitud.' 
                });
                return;
            }

            setStatusMessage({ 
                type: 'success', 
                message: 'Se ha enviado un enlace de recuperación a tu correo electrónico.' 
            });
            setEmailSent(true);

        } catch (error) {
            console.error('Error en recuperación de contraseña:', error);
            setStatusMessage({ 
                type: 'error', 
                message: 'Error de conexión con el servidor.' 
            });
        } finally {
            setIsLoading(false);
        }
    };

    // ==========================================================
    // 3. ESTRUCTURA DEL COMPONENTE (RENDERIZADO)
    // ==========================================================
    
    return (
        <main className="auth-login">
            <section className="auth-card" aria-labelledby="auth-title">
                {/* Encabezado */}
                <header className="auth-header">
                    <img src={logo} alt="PFEPS Logo" className="brand-logo" />
                    <h1 id="auth-title">Recuperar Contraseña</h1>
                    <p className="tagline">
                        Ingresa tu número de identificación y te enviaremos un enlace de recuperación
                    </p>
                </header>

                {/* Mensajes de estado */}
                {statusMessage.message && (
                    <p 
                        className={`status ${getStatusClass(statusMessage.type)}`} 
                        role="status" 
                        aria-live="polite"
                    >
                        {statusMessage.message}
                    </p>
                )}

                {!emailSent ? (
                    <>
                        {/* Formulario de Recuperación */}
                        <form onSubmit={handleSubmit}>
                            {/* Campo de Identificación */}
                            <div className="field">
                                <label htmlFor="identificacion">Número de Identificación</label>
                                <input
                                    type="text"
                                    id="identificacion"
                                    name="identificacion"
                                    placeholder="Ingresa tu número de identificación"
                                    value={identificacion}
                                    onChange={(e) => setIdentificacion(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Botones de Acción */}
                            <div className="form-actions">
                                <button
                                    type="submit"
                                    className="btn primary"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
                                </button>
                            </div>
                        </form>

                        {/* Link de regreso al login */}
                        <div className="auth-footer">
                            <p>
                                ¿Recordaste tu contraseña?{' '}
                                <Link to="/login" className="link-button">
                                    Volver al inicio de sesión
                                </Link>
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Mensaje de confirmación */}
                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn primary"
                                onClick={() => navigate('/login')}
                            >
                                Volver al Inicio de Sesión
                            </button>
                        </div>
                    </>
                )}
            </section>
        </main>
    );
}

export default ForgotPassword;
