import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { visualizarFactura } from '../utils/pdfGenerator'; 
import InvoiceForm from '../forms/InvoiceForm1.jsx';
import '../styles/Modules_clients_products_factures.css';

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
    const [isGenerating, setIsGenerating] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    // Función auxiliar para obtener el token y los headers
    const getAuthHeaders = () => {
        const token = sessionStorage.getItem('token'); // Lee del mismo lugar que AuthContext
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

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
            // CORRECCIÓN: Agregado de headers con Token
            const response = await fetch('http://localhost:8080/api/facturas', {
                headers: getAuthHeaders()
            });

            if (response.status === 401) throw new Error('Sesión expirada. Por favor inicie sesión de nuevo.');
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

    useEffect(() => { refreshKey
        fetchInvoices();
    }, [searchQuery, filterState, currentPage]); 

    const handleView = async (invoice) => {
        setIsGenerating(invoice.id_real);
        try {
            // CORRECCIÓN: Agregado de headers con Token en peticiones de PDF
            const headers = getAuthHeaders();
            
            const resEmisor = await fetch('http://localhost:8080/api/emisor', { headers });
            const emisorData = await resEmisor.json();

            const resFactura = await fetch(`http://localhost:8080/api/facturas/${invoice.id_real}`, { headers });
            if (!resFactura.ok) throw new Error("No se pudo obtener el detalle de la factura.");
            const facturaDB = await resFactura.json();

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

    // ... resto de las funciones (handleSearchChange, handleCreateNew, handleEdit, handleEmit)
    // que se mantienen igual ya que no hacen fetch directo o usan navegación.

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); 
    };

    const handleCreateNew = () => {
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
    };

    const handleFormSuccess = () => {
        setRefreshKey(prev => prev + 1);
        closeForm();
    };

    const handleEdit = (invoice) => { 
        if (invoice.id_real) {
            navigate(`/facturas/editar/${invoice.id_real}`);
        } else {
            alert("Error: El objeto factura no tiene 'id_real'.");
        }
    };

    const handleEmit = (invoice) => { alert(`Emitiendo factura ${invoice.id}...`); };

    return (
        <div className="invoice-management">
            <h2>Gestión de Facturas</h2>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="actions">
                <button 
                    className="btn-primary" 
                    onClick={handleCreateNew}
                    disabled={loading}
                >
                    ➕ Crear Nueva Factura
                </button>
                <input 
                    type="text" 
                    placeholder="Buscar por ID o Cliente"
                    value={searchQuery} 
                    onChange={handleSearchChange}
                />
                <select 
                    value={filterState} 
                    onChange={(e) => { setFilterState(e.target.value); setCurrentPage(1); }} 
                    disabled={loading}
                >
                    <option value="">Todos los Estados</option>
                    <option value="Pagada">Pagada</option>
                    <option value="Pendiente">Pendiente</option>
                </select>
            </div>

            {loading && <p>Cargando...</p>}

            <table className="invoice-table">
                        <thead>
                            <tr>
                                <th># Factura</th>
                                <th>Fecha</th>
                                <th>Cliente</th>
                                <th>Productos</th>
                                <th>Total</th>
                                <th>Estado</th> 
                                <th>Acciones</th> 
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.length > 0 ? (
                                invoices.map((invoice) => (
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
                                                ) : (<small>Sin detalle</small>)}
                                            </div>
                                        </td>
                                        <td>
                                            <strong>${parseFloat(invoice.total || 0).toLocaleString('es-CO')}</strong>
                                        </td>
                                        <td>
                                            <span className={`invoice-status status-${invoice.status?.toLowerCase()}`}>
                                                {invoice.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button 
                                                className="ver btn-info" 
                                                onClick={() => handleView(invoice)}
                                                disabled={isGenerating === invoice.id_real}
                                                title="Ver factura en PDF"
                                            >
                                                {isGenerating === invoice.id_real ? '...' : '📄 Ver'}
                                            </button>
                                            <button className="editar btn-warning" onClick={() => handleEdit(invoice)} disabled={loading} title="Editar factura">✏️ Editar</button>
                                            <button className="emitir btn-success" onClick={() => handleEmit(invoice)} disabled={loading} title="Emitir factura">📤 Emitir</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                                        No se encontraron facturas.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

            {showForm && (
                <div className="modal-overlay" role="dialog" aria-modal="true">
                    <div className="modal-body">
                        <button className="modal-close" onClick={closeForm}>✕</button>
                        <InvoiceForm onSuccess={handleFormSuccess} onCancel={closeForm} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default Facturas;