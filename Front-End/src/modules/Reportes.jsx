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
      subs: ["Todas las Facturas", "Pendientes", "Pagadas", "Anuladas","Vencidas","Parcial","Emitidas","No Emitidas"],
      headers: ["N° Reporte", "Fecha", "Archivo", "Acciones"],
      chart: [{h: '65%', l: 'Sem 1'}, {h: '90%', l: 'Sem 2'}, {h: '55%', l: 'Sem 3'}, {h: '80%', l: 'Sem 4'}],
      data: []
    },
    clientes: {
      title: "Reporte de Clientes",
      subs: ["Todos los Clientes", "Clientes Nuevos", "Clientes Antiguos","Compraron","No Compraron"],
      headers: ["N° Reporte", "Fecha", "Archivo", "Acciones"],
      chart: [{h: '100%', l: 'VIP'}, {h: '60%', l: 'Frecuente'}, {h: '25%', l: 'Ocasional'}],
      data: []
    },
    productos: {
      title: "Reporte de Productos",
      subs: ["Todos los Productos", "Mas Vendidos", "Menos Vendidos", "Sin Ventas"],
      headers: ["N° Reporte", "Fecha", "Archivo", "Acciones"],
      chart: [{h: '40%', l: 'Serv. A'}, {h: '95%', l: 'Licencia X'}, {h: '70%', l: 'Soporte'}],
      data: [ ]
    }
  };

  const current = config[view];

  // Calcular fecha local actual (no UTC) para restricción de reportes
  const today = new Date();
  const todayStr = today.getFullYear() + '-' + 
                   String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                   String(today.getDate()).padStart(2, '0');

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
        

        {/* Panel de Filtros de Fecha y Tipo */}
        <div className="report-panel">
          <span className="panel-label">Filtros de Reporte</span>
          <div className="filter-form">            <select 
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
                max={todayStr}
                onChange={(e) => setDateFrom(e.target.value)} 
              />
              <input 
                type="date" 
                className="ui-input" 
                value={dateTo}
                max={todayStr}
                onChange={(e) => setDateTo(e.target.value)} 
              />
            </div>
            
            <button className="ui-btn-primary" onClick={handleGenerate}>
              🔍 Generar Reporte
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
                    ⬇️Descargar
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