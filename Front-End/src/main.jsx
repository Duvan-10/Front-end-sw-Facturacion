/**
 * ============================================================
 * PUNTO DE ENTRADA DE REACT (FRONTEND)
 * Archivo: main.jsx
 * RESPONSABILIDAD:
 *  - Montar el componente raíz App en el DOM.
 *  - Envolver la aplicación con BrowserRouter, ThemeProvider y AuthProvider.
 * ============================================================
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// 1. Componente que maneja la navegación del navegador (el sistema de rutas).
import { BrowserRouter } from 'react-router-dom';
// 2. Proveedor que expone el estado de autenticación en toda la App.
import { AuthProvider } from './context/AuthContext.jsx'; 
// 3. Proveedor global de tema (claro/oscuro).
import { ThemeProvider } from './context/ThemeContext.jsx';

import './styles/global.css'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider> 
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
