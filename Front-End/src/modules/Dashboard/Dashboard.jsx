import React from 'react';
import './Dashboard.css'; // Importamos los estilos

function Dashboard() {
  // Los datos podrían venir de un estado o props, pero por ahora son fijos.
  const dashboardData = [
    { id: 'ventas', value: '0', label: 'Ventas hoy' },
    { id: 'clientes', value: '0', label: 'Clientes registrados' },
    { id: 'productos', value: '0', label: 'Productos en stock' },
    { id: 'facturas', value: '0', label: 'Facturas este mes' },
  ];

  return (
    <> {/* Usamos un fragmento para envolver el contenido */}
      <header>Monitor Facturas</header>

      <section className="dashboard">
        {dashboardData.map((card) => (
          <div className="card" key={card.id}>
            {/* Nota: En JSX, 'id' se mantiene si es necesario, 
               pero se usaría 'className' en lugar de 'class' */}
            <h2 id={card.id}>{card.value}</h2>
            <p>{card.label}</p>
          </div>
        ))}
      </section>

      {/* Nota: La etiqueta <script src="dasboard.js"></script> no se traduce a JSX
         directamente. La lógica de JavaScript se manejaría dentro del 
         componente con Hooks como 'useState' o 'useEffect'. */}
    </>
  );
}

export default Dashboard;