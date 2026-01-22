import React, { useState, useEffect } from 'react';
import '../styles/Reportes.css';
import { API_URL } from '../api';
import * as XLSX from 'xlsx';

const Reportes = () => {
  const [view, setView] = useState('facturas');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [subType, setSubType] = useState('');
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Datos maestros
  const config = {
    facturas: {
      title: "Análisis de Facturación",
      subs: ["Todas las Facturas", "Pendientes", "Pagadas", "Anuladas","Vencidas","Parcial","Emitidas","No Emitidas"],
      headers: ["Reporte", "Fecha", "Archivo", "Creado por", "Acciones"],
      prefix: "RP_FAC"
    },
    clientes: {
      title: "Reporte de Clientes",
      subs: ["Todos los Clientes", "Clientes Nuevos", "Clientes Antiguos","Compraron","No Compraron"],
      headers: ["Reporte", "Fecha", "Archivo", "Creado por", "Acciones"],
      prefix: "RP_CL"
    },
    productos: {
      title: "Reporte de Productos",
      subs: ["Todos los Productos", "Mas Vendidos", "Menos Vendidos", "Sin Ventas"],
      headers: ["Reporte", "Fecha", "Archivo", "Creado por", "Acciones"],
      prefix: "RP_PD"
    }
  };

  const current = config[view];

  const today = new Date();
  const todayStr = today.getFullYear() + '-' + 
                   String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                   String(today.getDate()).padStart(2, '0');

  // Cargar historial de reportes al montar componente o cambiar vista
  useEffect(() => {
    setSubType(current.subs[0]);
    cargarReportes();
  }, [view]);

  // Función para cargar historial de reportes desde el backend
  const cargarReportes = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${API_URL}/reportes?tipo=${view}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Error al cargar reportes');
      
      const data = await response.json();
      setReportes(data);
    } catch (error) {
      console.error('Error cargando reportes:', error);
    }
  };

  // Función para generar reporte y guardarlo en BD
  const handleGenerate = async () => {
    if (!dateFrom || !dateTo) {
      alert("Por favor seleccione un rango de fechas.");
      return;
    }
    if (!subType) {
      alert("Por favor seleccione un tipo de reporte.");
      return;
    }

    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        alert('Sesión expirada. Por favor inicia sesión nuevamente.');
        setLoading(false);
        return;
      }
      
      const response = await fetch(`${API_URL}/reportes/generar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tipo: view,
          subTipo: subType,
          dateFrom,
          dateTo
        })
      });

      if (!response.ok) throw new Error('Error generando reporte');

      const result = await response.json();
      alert('✅ Reporte generado y guardado exitosamente');
      
      // Recargar tabla de reportes
      await cargarReportes();
      
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  // Función para descargar reporte en Excel
  const descargarExcel = async (reporteId, archivo) => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        alert('Sesión expirada. Por favor inicia sesión nuevamente.');
        return;
      }
      
      // Obtener datos del reporte desde el backend
      const response = await fetch(`${API_URL}/reportes/${reporteId}/datos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Error obteniendo datos');
      
      const datos = await response.json();
      
      if (datos.length === 0) {
        alert('ℹ️ No hay datos para exportar en este reporte');
        return;
      }
      
      // Generar Excel con SheetJS
      const ws = XLSX.utils.json_to_sheet(datos);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Reporte");
      
      // Descargar archivo con nombre personalizado
      XLSX.writeFile(wb, `${archivo}.xlsx`);
      
    } catch (error) {
      console.error('Error descargando:', error);
      alert('❌ Error al descargar el archivo');
    }
  };

  // Función para procesar el reporte basándose en los filtros
  const handleGenerate_OLD = () => {
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
            
            <button 
              className="ui-btn-primary" 
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? '⏳ Generando...' : '🔍 Generar Reporte'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de Resultados Final */}
      <div className="report-panel table-full-width">
        <div className="table-header-info">
          <span>Historial de Reportes: <strong>{view.charAt(0).toUpperCase() + view.slice(1)}</strong></span>
        </div>
        <table className="ui-table">
          <thead>
            <tr>{current.headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {reportes.length === 0 ? (
              <tr>
                <td colSpan={current.headers.length} style={{textAlign: 'center', padding: '30px', color: 'var(--rep-text-muted)'}}>
                  No hay reportes generados aún
                </td>
              </tr>
            ) : (
              reportes.map((rep) => (
                <tr key={rep.id}>
                  <td><strong>{current.prefix}</strong></td>
                  <td>{new Date(rep.fecha).toLocaleDateString('es-ES')}</td>
                  <td>{rep.archivo}</td>
                  <td>{rep.creador || 'Usuario'}</td>
                  <td className="actions-cell">
                    <button 
                      className="btn-table-excel" 
                      onClick={() => descargarExcel(rep.id, rep.archivo)}
                    >
                      ⬇️ Descargar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reportes;