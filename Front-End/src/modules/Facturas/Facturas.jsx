import React, { useState, useEffect } from 'react';
import '../../styles/global.css';

// Cantidad de elementos por página
const ITEMS_PER_PAGE = 30; 

function Facturas() {
    // 1. Estados principales
    const [invoices, setInvoices] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 2. Estados para Búsqueda y Paginación
    const [searchQuery, setSearchQuery] = useState(''); 
    const [filterState, setFilterState] = useState(''); 
    const [currentPage, setCurrentPage] = useState(1); 
    const [totalItems, setTotalItems] = useState(0); 

    // =======================================================
    // I. LÓGICA DE APOYO (FORMATO)
    // =======================================================
    
    const formatDate = (dateString) => {
        if (!dateString) return '---';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // =======================================================
    // II. CARGA DE DATOS (Backend)
    // =======================================================
    
    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8080/api/facturas');
            if (!response.ok) throw new Error('No se pudo conectar con el servidor.');

            const data = await response.json();
            let filtered = data;
            
            if (filterState) {
                filtered = filtered.filter(inv => inv.status === filterState);
            }

            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                filtered = filtered.filter(inv => 
                    inv.id.toLowerCase().includes(query) ||
                    inv.client.toLowerCase().includes(query)
                );
            }
            
            const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
            const pagedInvoices = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

            setTotalItems(filtered.length);
            setInvoices(pagedInvoices);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, [searchQuery, filterState, currentPage]); 

    // =======================================================
    // III. HANDLERS (Acciones)
    // =======================================================
    
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); 
    };

    const handleCreateNew = () => {
        window.open('/facturas/crear', '_blank'); 
    };

    const handleView = (invoice) => {
        // Lógica para abrir vista de solo lectura
        window.open(`/facturas/ver/${invoice.id}`, '_blank');
    };
    
    const handleEdit = (invoice) => {
        window.open(`/facturas/editar/${invoice.id}`, '_blank');
    };

    const handleEmit = (invoice) => {
        alert(`Emitiendo factura ${invoice.id}...`);
    };

    // =======================================================
    // IV. RENDERIZADO
    // =======================================================

    return (
        <div className="main-content">
            <h1 className="module-title">Gestión de Facturas</h1>

            {/* Seccion de Controles */}
            <section className="controls-section card">
                <div className="search-bar">
                    <label htmlFor="search">Buscar Factura:</label>
                    <input 
                        type="text" 
                        id="search"
                        className="search-input" 
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="ID o Cliente..."
                    />
                </div>
                
                <select 
                    value={filterState} 
                    onChange={(e) => { setFilterState(e.target.value); setCurrentPage(1); }} 
                    className="select-filter form-control" 
                >
                    <option value="">Todos los Estados</option>
                    <option value="Pagada">Pagada</option>
                    <option value="Pendiente">Pendiente</option>
                </select>
                
                <button className="btn btn-primary" onClick={handleCreateNew}>
                    Crear Nueva Factura
                </button>
            </section>
            
            <hr/>

            <section className="list-section">
                <h2>Listado de Facturas ({totalItems} en total)</h2>

                {loading && <p className="loading-text">Cargando datos desde la base de datos...</p>}
                {error && <p className="error-message" style={{color: 'red'}}>{error}</p>}

                {!loading && !error && (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th># Factura</th>
                                <th>Fecha</th>
                                <th>Cliente</th>
                                <th>Tipo</th>
                                <th>Total</th>
                                <th>Estado</th> 
                                <th>Acciones</th> 
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((invoice) => (
                                <tr key={invoice.id}>
                                    <td><strong>{invoice.id}</strong></td>
                                    <td>{formatDate(invoice.date)}</td>
                                    <td>{invoice.client}</td>
                                    <td>{invoice.tipoFactura}</td>
                                    <td>${parseFloat(invoice.total).toLocaleString()}</td>
                                    <td>
                                        <span className={`invoice-status status-${invoice.status?.toLowerCase()}`}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <button className="btn btn-sm btn-view" onClick={() => handleView(invoice)}>Ver</button>
                                        <button className="btn btn-sm btn-edit" onClick={() => handleEdit(invoice)}>Editar</button>
                                        <button className="btn btn-sm btn-success" onClick={() => handleEmit(invoice)}>Emitir</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
        </div>
    );
}

export default Facturas;