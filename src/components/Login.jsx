import { useState } from 'react';
// Asegúrate de que este archivo importe el CSS con las clases .auth, .field, etc.
// Por ejemplo: import './styles.css' o import './LoginDark.css'
import './styles.css'; 
import logo from '../assets/logo.png'; // Usamos la importación local

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ email, password, rememberMe });
    // Aquí iría la lógica de autenticación (ej. llamada a API)
  };

  return (
    // 1. Contenedor principal para centrar (Clase .auth del CSS)
    <main className="auth">
      {/* 2. Tarjeta del formulario (Clase .auth-card del CSS) */}
      <section className="auth-card" aria-labelledby="login-title">

        {/* 3. Encabezado (Clase .auth-header del CSS) */}
        <header className="auth-header">
          <img src={logo} alt="PFEPS Logo" className="brand-logo" /> 
          <h1 id="login-title">PFEPS</h1>
          <p className="subtitle">Accede a tu cuenta</p>
          <p className="tagline">Software de Facturación Electrónica</p>
        </header>

        <form onSubmit={handleSubmit}>
          {/* Campo de Email (Clase .field del CSS) */}
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
            {/* Opcional: <small className="help">...</small> o <p className="error">...</p> si los necesitas */}
          </div>

          {/* Campo de Contraseña (Clase .field y .label-row del CSS) */}
          <div className="field">
            <div className="label-row">
              <label htmlFor="password">Contraseña</label>
              <button
                type="button"
                className="link-button" // Usamos .link-button para el estilo "Mostrar"
                onClick={togglePasswordVisibility}
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

          {/* Fila de Checkbox y Olvidé Contraseña (Clase .form-row del CSS) */}
          <div className="form-row">
            <label className="checkbox"> {/* Clase .checkbox para el contenedor de Recordarme */}
              <input
                type="checkbox"
                name="remember"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <span>Recordarme</span>
            </label>
            <a href="#" className="link">Olvidé mi contraseña</a> {/* Clase .link para el enlace */}
          </div>

          {/* Acciones del Formulario */}
          <div className="form-actions">
            {/* Botón Iniciar Sesión (Clase .btn .primary del CSS) */}
            <button type="submit" className="btn primary">Iniciar sesión</button>
          </div>
          
          {/* Enlace Registrarse (Clase .register-wrapper del CSS) */}
          <div className="register-wrapper">
            {/* Usamos un <a> con la clase .register-link para el estilo destacado */}
            <a href="#" className="register-link">Registrarse</a>
          </div>

          <div className="status" role="status" aria-live="polite"></div>
        </form>

      </section>
    </main>
  );
}

export default Login;