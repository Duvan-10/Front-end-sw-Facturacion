import React, { useState } from 'react';
import '../../styles/Reportes.css';

// Datos de reporte simulados
const initialReports = [
  { id: 1, client: 'Cliente A', product: 'Licencia Premium', date: '2025-10-01', total: 150.00 },
  { id: 2, client: 'Cliente B', product: 'Instalación HW', date: '2025-10-15', total: 85.50 },
  { id: 3, client: 'Cliente C', product: 'Hosting Anual', date: '2025-11-05', total: 1200.00 },
  { id: 4, client: 'Cliente A', product: 'Servicio Cloud', date: '2025-11-20', total: 45.99 },
];

function Reports() {
  // Estado para los filtros de fecha
  const [filters, setFilters] = useState({
    fechaInicio: '',
    fechaFin: '',
  });

  // Estado para los reportes mostrados (inicialmente todos)
  const [filteredReports, setFilteredReports] = useState(initialReports);

  // Maneja el cambio en los inputs de fecha
  const handleFilterChange = (e) => {
    const { id, value } = e.target;
    setFilters({ ...filters, [id]: value });
  };

  // Maneja la generación del reporte (filtra la tabla)
  const handleGenerateReport = (e) => {
    e.preventDefault();
    
    // Convertir las fechas de filtro a objetos Date
    const start = filters.fechaInicio ? new Date(filters.fechaInicio) : null;
    const end = filters.fechaFin ? new Date(filters.fechaFin) : null;

    if (!start || !end) {
        alert("Por favor, selecciona tanto la fecha de inicio como la de fin.");
        return;
    }

    // Filtrar los reportes
    const results = initialReports.filter(report => {
        const reportDate = new Date(report.date);
        
        // Comparación: fecha del reporte debe ser >= a inicio Y <= a fin
        return reportDate >= start && reportDate <= end;
    });

    setFilteredReports(results);
    alert(`Reporte generado. ${results.length} resultados encontrados entre ${filters.fechaInicio} y ${filters.fechaFin}.`);
  };

  // Función para simular la exportación a CSV
  const exportToCSV = () => {
    // Aquí iría la lógica real para construir y descargar el archivo CSV
    console.log('Exportando datos a CSV...');
    // Ejemplo simple:
    const header = Object.keys(filteredReports[0]).join(',');
    const rows = filteredReports.map(report => Object.values(report).join(','));
    const csvContent = [header, ...rows].join('\n');
    
    console.log(csvContent);
    alert(`Se ha simulado la exportación de ${filteredReports.length} filas a CSV.`);
  };

  return (
    <>
      <header>Reportes e Informes</header>

      {/* --- Filtros --- */}
      <section className="filter-section">
        <h2>Filtrar reportes</h2>
        <form onSubmit={handleGenerateReport}>
          <label htmlFor="fechaInicio">Fecha inicio:</label>
          <input 
            type="date" 
            id="fechaInicio" 
            value={filters.fechaInicio}
            onChange={handleFilterChange}
            required 
          />

          <label htmlFor="fechaFin">Fecha fin:</label>
          <input 
            type="date" 
            id="fechaFin" 
            value={filters.fechaFin}
            onChange={handleFilterChange}
            required 
          />

          <button type="submit" className="btn">Generar Reporte</button>
        </form>
      </section>

      {/* --- Tabla de reportes --- */}
      <section className="list-section">
        <h2>Resultados ({filteredReports.length})</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Cliente</th>
              <th>Producto</th>
              <th>Fecha</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report) => (
              <tr key={report.id}>
                <td>{report.id}</td>
                <td>{report.client}</td>
                <td>{report.product}</td>
                <td>{report.date}</td>
                <td>${report.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* El evento 'onclick' directo se reemplaza por una función de manejo en React */}
        <button className="btn export-btn" onClick={exportToCSV}>Exportar a CSV</button>
      </section>

      {/* El script externo (informes.js) ha sido reemplazado por las funciones de React */}
    </>
  );
}

export default Reports;