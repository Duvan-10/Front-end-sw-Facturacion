/**
 * ============================================================
 * PANTALLA DE RESTABLECIMIENTO DE CONTRASEÑA
 * Archivo: ResetPassword.jsx
 * RESPONSABILIDAD:
 *  - Permitir al usuario establecer una nueva contraseña.
 *  - Validar el token de recuperación.
 *  - Redirigir al login tras restablecer exitosamente.
 * ============================================================
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { API_URL } from '../api';
import logo from '../assets/logo.png';
import '../styles/Registro_Login.css';

function ResetPassword() {
    // ========================================================
    // 1. HOOKS Y ESTADOS
    // ========================================================
    
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ type: null, message: '' });
    const [passwordReset, setPasswordReset] = useState(false);

    // ========================================================
    // 2. EFECTOS SECUNDARIOS
    // ========================================================

    // Verificar que existe un token válido
    useEffect(() => {
        if (!token) {
            setStatusMessage({ 
                type: 'error', 
                message: 'Enlace de recuperación inválido.' 
            });
        }
    }, [token]);

    // ========================================================
    // 3. MANEJADORES Y LÓGICA DE VALIDACIÓN
    // ========================================================

    // Helper para determinar el color del mensaje según el tipo
    const getStatusClass = (type) => {
        if (type === 'error') return 'error-message';
        if (type === 'success') return 'success-message';
        return 'info-message';
    };

    // Función para validar los campos
    const validateForm = () => {
        if (!newPassword) {
            setStatusMessage({ 
                type: 'error', 
                message: 'La contraseña es obligatoria.' 
            });
            return false;
        }

        if (newPassword.length < 6) {
            setStatusMessage({ 
                type: 'error', 
                message: 'La contraseña debe tener al menos 6 caracteres.' 
            });
            return false;
        }

        if (newPassword !== confirmPassword) {
            setStatusMessage({ 
                type: 'error', 
                message: 'Las contraseñas no coinciden.' 
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
            const response = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, newPassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                setStatusMessage({ 
                    type: 'error', 
                    message: data.message || 'Error al restablecer la contraseña.' 
                });
                return;
            }

            setStatusMessage({ 
                type: 'success', 
                message: 'Contraseña actualizada exitosamente.' 
            });
            setPasswordReset(true);

            // Redirigir al login después de 2 segundos
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (error) {
            console.error('Error al restablecer contraseña:', error);
            setStatusMessage({ 
                type: 'error', 
                message: 'Error de conexión con el servidor.' 
            });
        } finally {
            setIsLoading(false);
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
                    <h1 id="auth-title">Restablecer Contraseña</h1>
                    <p className="tagline">Ingresa tu nueva contraseña</p>
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

                {!passwordReset && token ? (
                    <>
                        {/* Formulario de Restablecimiento */}
                        <form onSubmit={handleSubmit}>
                            {/* Campo de Nueva Contraseña */}
                            <div className="field">
                                <div className="label-mostrar">
                                    <label htmlFor="newPassword">Nueva Contraseña</label>
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
                                    id="newPassword"
                                    name="newPassword"
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Campo de Confirmar Contraseña */}
                            <div className="field">
                                <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                                    {isLoading ? 'Actualizando...' : 'Restablecer Contraseña'}
                                </button>
                            </div>
                        </form>

                        {/* Link de regreso al login */}
                        <div className="auth-footer">
                            <p>
                                <Link to="/login" className="link-button">
                                    Volver al inicio de sesión
                                </Link>
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Mensaje final */}
                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn primary"
                                onClick={() => navigate('/login')}
                            >
                                Ir al Inicio de Sesión
                            </button>
                        </div>
                    </>
                )}
            </section>
        </main>
    );
}

export default ResetPassword;
