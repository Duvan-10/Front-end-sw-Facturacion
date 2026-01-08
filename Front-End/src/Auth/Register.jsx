/**
 * ============================================================================
 * COMPONENTE DE REGISTRO
 * Formulario de registro de administradores con validaciones y conexión a API.
 * ============================================================================
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import '../styles/styles.css';

function Register() {
    // Navegación y consumo del contexto de autenticación
    const navigate = useNavigate();
    const { register, isLoading, statusMessage, setStatusMessage } = useAuth();

    // Estados para los campos del formulario y control de interfaz
    const [identification, setIdentification] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [registrationSuccess, setRegistrationSuccess] = useState(false);

    // Constantes de configuración y Expresiones Regulares para validación
    const titleText = 'Crear una nueva cuenta de Administrador';
    const MAX_DIGITS = 10;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Formato básico de email
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\.-]+$/; // Solo letras, espacios y acentos
    const identificationRegex = /^[0-9]+$/; // Solo números

    // Efecto para limpiar mensajes de estado globales al cargar el componente
    useEffect(() => {
        if (setStatusMessage) setStatusMessage({ type: null, message: '' });
    }, [setStatusMessage]);

    /**
     * Valida un campo individual y retorna un mensaje de error si falla.
     * Se usa tanto en onBlur como en handleSubmit.
     */
    const validateField = (fieldName, value) => {
        if (!value || !value.trim()) return 'Este campo es obligatorio.';
        
        switch (fieldName) {
            case 'identification':
                if (!identificationRegex.test(value)) return 'Solo se permiten números.';
                if (value.length > MAX_DIGITS) return `Máximo ${MAX_DIGITS} dígitos.`;
                break;
            case 'name':
                if (!nameRegex.test(value)) return 'Solo letras, espacios, puntos y guiones.';
                break;
            case 'email':
                if (!emailRegex.test(value)) return 'Formato de correo inválido.';
                break;
            case 'password':
                if (value.length < 6) return 'Mínimo 6 caracteres.';
                break;
            case 'confirmPassword':
                if (value !== password) return 'Las contraseñas no coinciden.';
                break;
            default: break;
        }
        return null;
    };

    /**
     * Maneja la escritura en los inputs.
     * Actualiza el estado y limpia errores específicos si el formato es correcto.
     */
    const handleChange = (e, setter) => {
        const { name, value } = e.target;
        setter(value);

        // Limpia el mensaje global de error si el usuario empieza a corregir
        if (statusMessage.message) setStatusMessage({ type: null, message: '' });

        setErrors(prev => {
            const newErrors = { ...prev };
            // Validación inmediata para impedir caracteres inválidos mientras se escribe
            if (name === 'identification' && value && !identificationRegex.test(value)) {
                newErrors.identification = 'Solo se permiten números.';
            } else if (name === 'name' && value && !nameRegex.test(value)) {
                newErrors.name = 'Solo letras, espacios, puntos y guiones.';
            } else {
                // Si el formato es válido (o está vacío), eliminamos el error visual
                delete newErrors[name];
            }
            return newErrors;
        });
    };

    // Valida el campo cuando el usuario quita el foco del input
    const handleBlur = (e) => {
        const { name, value } = e.target;
        const error = validateField(name, value);
        setErrors(prev => {
            const newErrors = { ...prev };
            if (error) newErrors[name] = error;
            else delete newErrors[name];
            return newErrors;
        });
    };

    // Manejo del envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        const fields = { identification, name, email, password, confirmPassword };
        const newErrors = {};
        
        // Validar todos los campos antes de enviar
        Object.keys(fields).forEach(key => {
            const error = validateField(key, fields[key]);
            if (error) newErrors[key] = error;
        });

        // Si hay errores locales, detenemos el envío
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setStatusMessage({ type: 'error', message: 'Por favor, corrige los errores.' });
            return;
        }

        // Llamada al servicio de registro
        const success = await register({ identification, name, email, password });
        if (success) {
            setRegistrationSuccess(true);
            setStatusMessage({ type: 'success', message: '¡Registro Exitoso! Redirigiendo...' });
            setTimeout(() => navigate('/login'), 2000);
        }
    };

    return (
        <main className="auth-register">
            <section className="auth-card" aria-labelledby="auth-title">
                <header className="auth-header">
                    <img src={logo} alt="PFEPS Logo" className="brand-logo" />
                    <h1 id="auth-title">PFEPS</h1>
                    <p className="subtitle">{titleText}</p>
                </header>

                {statusMessage.message && (
                    <p className={`status ${statusMessage.type === 'error' ? 'error-message' : 'success-message'}`} role="status">
                        {statusMessage.message}
                    </p>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="field">
                        <label htmlFor="identification">NIT / CC</label>
                        <input
                            type="text"
                            id="identification"
                            name="identification"
                            value={identification}
                            maxLength={MAX_DIGITS}
                            onChange={(e) => handleChange(e, setIdentification)}
                            onBlur={handleBlur}
                            className={errors.identification ? 'input-error' : ''}
                            placeholder="Tu número de cédula"
                        />
                        {errors.identification && <p className="help error">{errors.identification}</p>}
                    </div>

                    <div className="field">
                        <label htmlFor="name">Nombre Completo / Razón Social</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={name}
                            onChange={(e) => handleChange(e, setName)}
                            onBlur={handleBlur}
                            className={errors.name ? 'input-error' : ''}
                            placeholder="Tu nombre o razón social"
                        />
                        {errors.name && <p className="help error">{errors.name}</p>}
                    </div>

                    <div className="field">
                        <label htmlFor="email">Correo electrónico</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => handleChange(e, setEmail)}
                            onBlur={handleBlur}
                            className={errors.email ? 'input-error' : ''}
                            placeholder="tu.correo@ejemplo.com"
                        />
                        {errors.email && <p className="help error">{errors.email}</p>}
                    </div>

                    <div className="field">
                        <div className="label-row">
                            <label htmlFor="password">Contraseña</label>
                            <button type="button" className="link-button" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? 'Ocultar' : 'Mostrar'}
                            </button>
                        </div>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => handleChange(e, setPassword)}
                            onBlur={handleBlur}
                            className={errors.password ? 'input-error' : ''}
                            placeholder="••••••••"
                        />
                        {errors.password && <p className="help error">{errors.password}</p>}
                    </div>

                    <div className="field">
                        <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="confirmPassword"
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => handleChange(e, setConfirmPassword)}
                            onBlur={handleBlur}
                            className={errors.confirmPassword ? 'input-error' : ''}
                            placeholder="Repite tu contraseña"
                        />
                        {errors.confirmPassword && <p className="help error">{errors.confirmPassword}</p>}
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn primary" disabled={isLoading}>
                            {isLoading ? 'Guardando...' : 'Completar Registro'}
                        </button>
                    </div>

                </form>
            </section>
        </main>
    );
}

export default Register;