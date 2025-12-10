// Front-end/src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // 👈 1. Importa tu componente raíz

// 2. Importa estilos globales si los tienes (ej. un archivo de reset o variables globales)


// 3. Renderiza la aplicación en el 'div id="root"' del index.html
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App /> {/* 👈 Renderiza App, el cual a su vez renderiza tu Login */}
  </React.StrictMode>,
);