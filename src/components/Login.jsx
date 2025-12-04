import { useState } from 'react';
import './Login.css';
import logo from '../assets/logo.png'; // Ajusta la ruta si es necesario

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ email, password, rememberMe });
  };

  return (
    <div className="login-container">
      <img src={logo} alt="PFEPS Logo" className="logo-img" />
      <h1 className="logo-text">PFEPS</h1>
      <h2 className="subtitle">Tu Facturador</h2>
      <p className="description">Accede a tu cuenta</p>
      <p className="tagline">Software de Facturación Electrónica</p>

      <form onSubmit={handleSubmit} className="login-form">
        <label>
          Correo electrónico
          <input
            type="email"
            placeholder="Usa tu correo registrado"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label>
          Contraseña
          <div className="password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="show-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
        </label>

        <div className="options">
          <label>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
            />
            Recordarme
          </label>
          <a href="#" className="forgot-link">Olvidé mi contraseña</a>
        </div>

        <button type="submit" className="login-btn">Iniciar sesión</button>
        <button type="button" className="register-btn">Registrarse</button>
      </form>
    </div>
  );
}

export default Login;

