import React, { useState } from 'react';
import '../styles/Reportes.css';

const Reportes = () => {
  const [view, setView] = useState('facturas');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [subType, setSubType] = useState('');

  // Datos maestros simulados
  const config = {
    facturas: {
      title: "Análisis de Facturación",
      subs: ["Todas las Facturas", "Facturas Pendientes", "IVA Recaudado"],
      headers: ["Fecha", "Folio", "Cliente", "Estado", "Total", "Acciones"],
      chart: [{h: '65%', l: 'Sem 1'}, {h: '90%', l: 'Sem 2'}, {h: '55%', l: 'Sem 3'}, {h: '80%', l: 'Sem 4'}],
      data: [
        ["2026-01-15", "F-101", "Inversiones Delta", "Pagada", "$1,250"],
        ["2026-01-18", "F-102", "Juan Pérez", "Pendiente", "$450"]
      ]
    },
    clientes: {
      title: "Reporte de Clientes",
      subs: ["Ranking de Ventas", "Clientes Inactivos", "Nuevos Registros"],
      headers: ["Nombre Cliente", "Contacto", "Compras", "Inversión Total", "Acciones"],
      chart: [{h: '100%', l: 'VIP'}, {h: '60%', l: 'Frecuente'}, {h: '25%', l: 'Ocasional'}],
      data: [
        ["Empresa ABC", "contacto@abc.com", "12", "$8,900"],
        ["Tienda Local", "tienda@mail.com", "3", "$1,100"]
      ]
    },
    productos: {
      title: "Reporte de Productos",
      subs: ["Más Vendidos ($)", "Mayor Rotación (Cant)", "Sin Ventas"],
      headers: ["Producto", "Precio", "Cant. Vendida", "Total Bruto", "Acciones"],
      chart: [{h: '40%', l: 'Serv. A'}, {h: '95%', l: 'Licencia X'}, {h: '70%', l: 'Soporte'}],
      data: [
        ["Consultoría Pro", "$100", "25", "$2,500"],
        ["Soporte Anual", "$350", "10", "$3,500"]
      ]
    }
  };

  const current = config[view];

  // Función para procesar el reporte basándose en los filtros
  const handleGenerate = () => {
    if (!dateFrom || !dateTo) {
      alert("Por favor seleccione un rango de fechas para filtrar la tabla.");
      return;
    }
    console.log(`Generando reporte de ${view} (${subType}) desde ${dateFrom} hasta ${dateTo}`);
    // Aquí conectarías con tu API pasando estos parámetros
    alert(`Reporte actualizado: Mostrando datos de ${view} del periodo seleccionado.`);
  };

  return (
    <div className="report-main-wrapper">
      <header className="report-top-header">
        <h1>{current.title}</h1>
      </header>

      {/* Selector de Módulo Principal */}
      <div className="report-type-selector">
        {Object.keys(config).map((key) => (
          <button 
            key={key} 
            className={`selector-btn ${view === key ? 'active' : ''}`}
            onClick={() => {
                setView(key);
                setSubType(config[key].subs[0]); // Resetear sub-filtro al cambiar módulo
            }}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        ))}
      </div>

      <div className="report-grid-top">
        {/* Gráfico Dinámico */}
        <div className="report-panel">
          <span className="panel-label">Resumen Visual del Periodo</span>
          <div className="simple-bar-chart">
            {current.chart.map((bar, i) => (
              <div key={i} className="chart-bar" style={{ height: bar.h }} data-label={bar.l}></div>
            ))}
          </div>
        </div>

        {/* Panel de Filtros de Fecha y Tipo */}
        <div className="report-panel">
          <span className="panel-label">Filtros de Reporte</span>
          <div className="filter-form">
            <label className="filter-hint">Tipo Específico:</label>
            <select 
              className="ui-input" 
              value={subType} 
              onChange={(e) => setSubType(e.target.value)}
            >
              {current.subs.map((s, i) => <option key={i} value={s}>{s}</option>)}
            </select>
            
            <label className="filter-hint">Rango de Fechas:</label>
            <div className="date-row">
              <input 
                type="date" 
                className="ui-input" 
                value={dateFrom} 
                onChange={(e) => setDateFrom(e.target.value)} 
              />
              <input 
                type="date" 
                className="ui-input" 
                value={dateTo} 
                onChange={(e) => setDateTo(e.target.value)} 
              />
            </div>
            
            <button className="ui-btn-primary" onClick={handleGenerate}>
              🔍 Generar Reporte y Actualizar Tabla
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de Resultados Final */}
      <div className="report-panel table-full-width">
        <div className="table-header-info">
          <span>Mostrando: <strong>{subType || current.subs[0]}</strong></span>
          {dateFrom && <span> Periodo: {dateFrom} a {dateTo}</span>}
        </div>
        <table className="ui-table">
          <thead>
            <tr>{current.headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {current.data.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => <td key={j}>{cell}</td>)}
                <td className="actions-cell">
                  <button className="btn-table-excel" onClick={() => alert(`Descargando Excel detallado...`)}>
                    Excel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reportes;