import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import '../../styles/global.css';
import { visualizarFactura } from '../../utils/pdfGenerator'; 

const ITEMS_PER_PAGE = 30; 

function Facturas() {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState(''); 
    const [filterState, setFilterState] = useState(''); 
    const [currentPage, setCurrentPage] = useState(1); 
    const [totalItems, setTotalItems] = useState(0); 
    // 2. Estado para controlar el botón de "Ver" mientras genera
    const [isGenerating, setIsGenerating] = useState(null);

    const formatDate = (dateString) => {
        if (!dateString) return '---';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    };

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
                    inv.id.toString().toLowerCase().includes(query) ||
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

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); 
    };

    const handleCreateNew = () => { window.open('/facturas/crear', '_blank'); };

    // 3. MODIFICACIÓN DE HANDLEVIEW PARA GENERAR PDF
    const handleView = async (invoice) => {
        setIsGenerating(invoice.id_real);
        try {
            // A. Obtener datos del emisor
            const resEmisor = await fetch('http://localhost:8080/api/emisor');
            const emisorData = await resEmisor.json();

            // B. Obtener datos completos de la factura (con el JOIN que hicimos en backend)
            const resFactura = await fetch(`http://localhost:8080/api/facturas/${invoice.id_real}`);
            if (!resFactura.ok) throw new Error("No se pudo obtener el detalle de la factura.");
            const facturaDB = await resFactura.json();

            // C. Mapeo de datos al formato requerido por InvoicePDF
            const facturaMapeada = {
                numero_factura: facturaDB.numero_factura,
                fecha_emision: facturaDB.fecha_emision,
                cliente: {
                    identificacion: facturaDB.cliente.identificacion,
                    nombre_razon_social: facturaDB.cliente.nombre_razon_social,
                    telefono: facturaDB.cliente.telefono,
                    direccion: facturaDB.cliente.direccion
                },
                detalles: facturaDB.detalles.map(d => ({
                    cant: d.cant,
                    detail: d.detail,
                    unit: parseFloat(d.unit),
                    total: d.total
                })),
                subtotal: facturaDB.detalles.reduce((acc, d) => acc + d.total, 0),
                iva: facturaDB.detalles.reduce((acc, d) => acc + d.total, 0) * 0.19,
                total: facturaDB.detalles.reduce((acc, d) => acc + d.total, 0) * 1.19
            };

            await visualizarFactura(facturaMapeada, emisorData);
        } catch (err) {
            alert("Error al generar PDF: " + err.message);
        } finally {
            setIsGenerating(null);
        }
    };

    const handleEdit = (invoice) => { 
        console.log("Datos de la factura al editar:", invoice);
        if (invoice.id_real) {
            navigate(`/facturas/editar/${invoice.id_real}`);
        } else {
            alert("Error: El objeto factura no tiene 'id_real'.");
        }
    };

    const handleEmit = (invoice) => { alert(`Emitiendo factura ${invoice.id}...`); };

    return (
        <div className="main-content">
            <h1 className="module-title">Gestión de Facturas</h1>

            <section className="controls-section card">
                <div className="search-bar">
                    <label htmlFor="search">Buscar Factura:</label>
                    <input 
                        type="text" id="search" className="search-input" 
                        value={searchQuery} onChange={handleSearchChange}
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

                {loading && <p className="loading-text">Cargando datos...</p>}
                {error && <p className="error-message" style={{color: 'red'}}>{error}</p>}

                {!loading && !error && (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th># Factura</th>
                                <th>Fecha</th>
                                <th>Cliente</th>
                                <th style={{width: '25%'}}>Productos</th>
                                <th>Tipo</th>
                                <th>Total</th>
                                <th>Estado</th> 
                                <th>Acciones</th> 
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((invoice) => (
                                <tr key={invoice.id_real}> 
                                    <td><strong>{invoice.id}</strong></td>
                                    <td>{formatDate(invoice.date)}</td>
                                    <td>{invoice.client}</td>
                                    <td>
                                        <div className="product-relation-wrapper">
                                            {invoice.detalles && invoice.detalles.length > 0 ? (
                                                invoice.detalles.map((item, idx) => (
                                                    <span key={idx} className="product-badge">
                                                        {item.producto_nombre}
                                                    </span>
                                                ))
                                            ) : (<small style={{color: '#999'}}>Sin detalle</small>)}
                                        </div>
                                    </td>

                                    <td>{invoice.tipoFactura}</td>
                                    <td>${parseFloat(invoice.total).toLocaleString()}</td>
                                    <td>
                                        <span className={`invoice-status status-${invoice.status?.toLowerCase()}`}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        {/* BOTÓN "VER" ACTUALIZADO CON ESTADO DE CARGA */}
                                        <button 
                                            className="btn btn-sm btn-view" 
                                            onClick={() => handleView(invoice)}
                                            disabled={isGenerating === invoice.id_real}
                                        >
                                            {isGenerating === invoice.id_real ? '...' : 'Ver'}
                                        </button>
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