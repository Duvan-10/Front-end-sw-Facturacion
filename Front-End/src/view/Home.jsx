// Front-End/src/view/Home.jsx

import React from 'react';
import './Home.css';

function Home() {
  return (
    <>
      <header>PFEps - Software de Facturación Electrónica</header>

      {/* Menú de navegación */}
      <nav className="navbar">
        <ul>
          
          <li><a href="/dashboard">Dashboard</a></li>
          <li><a href="/facturas">Facturas</a></li>
          <li><a href="/clientes">Clientes</a></li>
          <li><a href="/productos">Productos</a></li>
          <li><a href="/reportes">Reportes</a></li>
        </ul>
      </nav>

      <main>
        <h2>Bienvenido al sistema</h2>
        <p>Selecciona un módulo en el menú para comenzar.</p>
      </main>

    </>
  );
}

export default Home;