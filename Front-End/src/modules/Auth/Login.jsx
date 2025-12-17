import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import logo from '../../assets/logo.png';
import './styles.css'; 

function Login() {
  const navigate = useNavigate(); 
  
  const [name, setName] = useState(''); 
  const [identification, setIdentification] = useState(''); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [statusMessage, setStatusMessage] = useState(''); 
  const [isLoading, setIsLoading] = useState(false);

  const [user, setUser] = useState(null); 
  const [token, setToken] = useState(sessionStorage.getItem('authToken')); 

  useEffect(() => {
    // Si ya existe un token en la sesión, redirigir directamente al Home
    if (token) {
        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            setUser(storedUser);
            navigate('/home', { replace: true }); 
        } catch (e) {
            handleLogout();
        }
    }
  }, [token, navigate]); 

  const handleLogout = () => {
    sessionStorage.removeItem('authToken');
    localStorage.removeItem('user'); 
    setToken(null);
    setUser(null);
    setStatusMessage('Sesión cerrada correctamente.');
    navigate('/');
  };

  const toggleMode = (mode) => {
    setIsRegistering(mode);
    setStatusMessage('');
    setName('');
    setIdentification('');
    setEmail('');
    setPassword('');
  };
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage('');

    try {
        const response = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            // ESTÁNDAR: Guardamos en sessionStorage para consistencia global
            sessionStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user)); 
            
            setToken(data.token);
            setUser(data.user);
            
            navigate('/home', { replace: true }); 
        } else {
            setStatusMessage(`❌ ${data.message || 'Credenciales incorrectas.'}`);
        }
    } catch (error) {
        setStatusMessage('⚠️ Error de conexión con el servidor (Puerto 8080).');
    } finally {
        setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage('');
    
    const userData = { name, identification, email, password };

    try {
        const response = await fetch('http://localhost:8080/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (response.ok) {
            setStatusMessage(`🎉 Registro exitoso. ¡Ya puedes iniciar sesión!`);
            toggleMode(false);
        } else {
            setStatusMessage(`❌ Error: ${data.message || 'Error al registrar.'}`);
        }
    } catch (error) {
        setStatusMessage('⚠️ Error de conexión con el servidor.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleSubmit = isRegistering ? handleRegister : handleLogin;
  const titleText = isRegistering ? 'Crear una nueva cuenta' : 'Accede a tu cuenta';
  const buttonText = isRegistering ? (isLoading ? 'Guardando...' : 'Completar Registro') : (isLoading ? 'Iniciando...' : 'Iniciar sesión');

  return (
    <main className="auth">
      <section className="auth-card">
        <header className="auth-header">
          <img src={logo} alt="Logo" className="brand-logo" /> 
          <h1>PFEPS</h1>
          <p className="subtitle">{titleText}</p>
        </header>

        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <>
              <div className="field">
                <label>Nombre Completo</label>
                <input type="text" placeholder="Ej. Juan Pérez" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="field">
                <label>Identificación (Cédula)</label>
                <input type="text" placeholder="Tu número de cédula" value={identification} onChange={(e) => setIdentification(e.target.value)} required />
              </div>
            </>
          )}

          <div className="field">
            <label>Correo electrónico</label>
            <input type="email" placeholder="correo@ejemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="field">
            <div className="label-row">
              <label>Contraseña</label>
              <button type="button" className="link-button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn primary" disabled={isLoading}>
              {buttonText}
            </button>
          </div>
          
          <div className="register-wrapper">
            <p className="subtitle">
              {isRegistering ? (
                <>¿Ya tienes una cuenta? <button type="button" className="link" onClick={() => toggleMode(false)}>Iniciar sesión</button></>
              ) : (
                <>¿No tienes una cuenta? <button type="button" className="link register-link" onClick={() => toggleMode(true)}>Regístrate</button></>
              )}
            </p>
          </div>

          {statusMessage && <p className="status">{statusMessage}</p>}
        </form>
      </section>
    </main>
  );
}

export default Login;