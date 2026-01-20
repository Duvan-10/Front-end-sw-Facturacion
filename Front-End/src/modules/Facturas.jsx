/**
 * ============================================================
 * MÓDULO DE FACTURAS
 * Archivo: Front-End/src/modules/Facturas.jsx
 * PROPÓSITO:
 *  - Mostrar listado de facturas con paginación y búsqueda
 *  - Permitir filtrar facturas por estado
 *  - Generar y visualizar PDFs de facturas
 *  - Cambiar estado de facturas mediante modal
 *  - Emitir facturas (generar PDF y enviar por email)
 *  - Crear, editar y eliminar facturas
 * ============================================================
 */

import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { visualizarFactura } from '../utils/pdfGenerator'; 
import InvoiceStatusModal from '../components/InvoiceStatusModal';
import InvoiceForm from '../forms/InvoiceForm.jsx';
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
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [showClientTypeModal, setShowClientTypeModal] = useState(false);
    const currentUser = (() => { try { return JSON.parse(sessionStorage.getItem('user')); } catch { return null; } })();
    const isAdmin = currentUser?.role === 'admin';

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

    const getInvoiceStatus = (invoice) => {
        // Si el estado es Vencida, mostrar en rojo
        if (invoice.status === 'Vencida') {
            return { status: '🔴 Vencida', className: 'status-vencida' };
        }
        
        // Si tiene fecha de vencimiento y es crédito, verificar si está vencida
        if (invoice.fecha_vencimiento && invoice.status !== 'Pagada' && invoice.status !== 'Anulada') {
            const today = new Date();
            const vencimiento = new Date(invoice.fecha_vencimiento);
            if (vencimiento < today) {
                return { status: '🔴 Vencida', className: 'status-vencida' };
            }
        }
        
        // Retornar estado normal
        const statusMap = {
            'Pagada': '🟢 Pagada',
            'Pendiente': '🟡 Pendiente',
            'Anulada': '⚪ Anulada',
            'Parcial': '🔵 Parcial'
        };
        
        return { status: statusMap[invoice.status] || invoice.status, className: `status-${invoice.status?.toLowerCase()}` };
    };

    const getEmisionStatus = (invoice) => {
        // Retorna el estado de emisión con color e ícono
        const estadoEmision = invoice.estado_emision || 'pendiente';
        
        const emisionMap = {
            'emitida': { 
                text: '✅ Emitida', 
                className: 'emision-emitida',
                bgColor: '#d4edda',
                textColor: '#155724',
                borderColor: '#c3e6cb'
            },
            'pendiente': { 
                text: '⏳ Pendiente', 
                className: 'emision-pendiente',
                bgColor: '#fff3cd',
                textColor: '#856404',
                borderColor: '#ffeaa7'
            },
            'error': { 
                text: '❌ Error', 
                className: 'emision-error',
                bgColor: '#f8d7da',
                textColor: '#721c24',
                borderColor: '#f5c6cb'
            }
        };
        
        return emisionMap[estadoEmision] || emisionMap['pendiente'];
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
        try {
            setIsGenerating(invoice.id_real);
            
            // Obtener datos de la factura
            const resFactura = await fetch(`http://localhost:8080/api/facturas/${invoice.id_real}`, {
                headers: getAuthHeaders()
            });
            if (!resFactura.ok) throw new Error('No se pudo obtener la factura');
            const facturaData = await resFactura.json();

            // Obtener datos del emisor
            const resEmisor = await fetch('http://localhost:8080/api/perfil/emisor', {
                headers: getAuthHeaders()
            });
            const emisorData = resEmisor.ok ? await resEmisor.json() : null;

            visualizarFactura(facturaData, emisorData);
        } catch (err) {
            alert('Error al generar PDF: ' + err.message);
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
        setShowClientTypeModal(true);
    };

    const handleClientTypeSelection = (type) => {
        setShowClientTypeModal(false);
        if (type === 'existing') {
            navigate('/home/facturas/crear');
        } else {
            // Redirige al formulario para cliente nuevo (Invoicenewclient.jsx)
            navigate('/home/facturas/crear-nuevo-cliente');
        }
    };

    const closeForm = () => {
        setShowForm(false);
        fetchInvoices(); // Recargar facturas al cerrar
    };

    const handleFormSuccess = () => {
        fetchInvoices(); // Recargar facturas al crear nueva
        closeForm();
    };

    const handleStatusChange = (newStatus) => {
        // Actualizar la factura en el estado
        setInvoices(invoices.map(inv => 
            inv.id_real === selectedInvoice.id ? { ...inv, status: newStatus } : inv
        ));
    };

    const handleEdit = (invoice) => {
        setSelectedInvoice({
            id: invoice.id_real,
            numero_factura: invoice.id,
            cliente_nombre: invoice.client,
            identificacion: invoice.identificacion,
            total: invoice.total,
            estado: invoice.status,
            fecha_vencimiento: invoice.fecha_vencimiento,
            date: invoice.date,
            detalles: invoice.detalles
        });
        setShowStatusModal(true);
    };

    const handleEmit = async (invoice) => {
        // Validar estado
        if (invoice.status === 'Anulada') {
            alert('❌ No se puede emitir una factura anulada');
            return;
        }

        // Validar si está vencida
        let isExpired = false;
        if (invoice.fecha_vencimiento && invoice.status !== 'Pagada' && invoice.status !== 'Anulada') {
            const today = new Date();
            const vencimiento = new Date(invoice.fecha_vencimiento);
            isExpired = vencimiento < today;
        }

        if (isExpired) {
            alert('❌ No se puede emitir una factura vencida');
            return;
        }

        // Mostrar alerta de confirmación con estado actual
        const statusEmoji = {
            'Pagada': '🟢',
            'Pendiente': '🟡',
            'Vencida': '🔴',
            'Anulada': '⚪',
            'Parcial': '🔵'
        };

        const statusText = statusEmoji[invoice.status] || '⚪';
        const confirmed = window.confirm(
            `¿Está seguro de emitir la factura ${invoice.id}?\n\n` +
            `Estado actual: ${statusText} ${invoice.status}\n` +
            `Cliente: ${invoice.client}\n` +
            `Total: $${Math.round(invoice.total).toLocaleString('es-CO')}\n\n` +
            `Se enviará al correo del cliente.`
        );

        if (!confirmed) return;

        try {
            setIsGenerating(invoice.id_real);
            const token = sessionStorage.getItem('token');
            
            // Llamar al backend para enviar email
            const response = await fetch(`http://localhost:8080/api/facturas/${invoice.id_real}/emit`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ 
                    clientEmail: invoice.email,
                    numeroFactura: invoice.id 
                })
            });

            const responseData = await response.json();

            if (!response.ok) {
                // Error al enviar
                if (responseData.estado_emision === 'error') {
                    alert(`❌ Error al emitir factura:\n\n${responseData.message}\n\nVerifique que el email del cliente sea válido.`);
                } else {
                    alert(`❌ Error: ${responseData.message || 'No se pudo emitir la factura'}`);
                }
            } else {
                // Éxito
                alert(`✅ ¡Factura emitida exitosamente!\n\nNúmero: ${responseData.numeroFactura}\nCliente: ${responseData.cliente}\nEmail: ${responseData.email}`);
            }
            
            fetchInvoices();
        } catch (err) {
            alert('❌ Error de conexión: ' + err.message);
        } finally {
            setIsGenerating(null);
        }
    };

    const handleDelete = async (invoice) => {
        if (!isAdmin) return;
        const ok = window.confirm(`¿Eliminar factura ${invoice.id}?`);
        if (!ok) return;
        try {
            const res = await fetch(`http://localhost:8080/api/facturas/${invoice.id_real}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            const data = await res.json();
            if (!res.ok) { throw new Error(data.message || 'Error al eliminar factura'); }
            fetchInvoices();
        } catch (err) {
            alert(err.message);
        }
    };

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
                                <th>Identificación</th>
                                <th>Total</th>
                                <th>Estado</th>
                                <th>Emisión</th>
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
                                        <td>{invoice.identificacion || '---'}</td>
                                        <td>
                                            <strong>${Math.round(parseFloat(invoice.total || 0)).toLocaleString('es-CO')}</strong>
                                        </td>
                                        
                                        <td>
                                            <span className={`invoice-status ${getInvoiceStatus(invoice).className}`}>
                                                {getInvoiceStatus(invoice).status}
                                            </span>
                                        </td>
                                        <td>
                                            <span 
                                                className={`emision-status ${getEmisionStatus(invoice).className}`}
                                            >
                                                {getEmisionStatus(invoice).text}
                                            </span>
                                        </td>
                                        <td>
                                            <button 
                                                className="ver btn-info" 
                                                onClick={() => handleView(invoice)}
                                                disabled={isGenerating === invoice.id_real}
                                                title="Ver factura en PDF"
                                            >
                                                {isGenerating === invoice.id_real ? '...' : '📄'}
                                            </button>
                                            <button className="editar btn-warning" onClick={() => handleEdit(invoice)} disabled={loading} title="Editar factura">✏️</button>
                                            <button className="emitir btn-success" onClick={() => handleEmit(invoice)} disabled={loading} title="Emitir factura">📤</button>
                                            {isAdmin && (
                                                <button className="eliminar btn-danger" onClick={() => handleDelete(invoice)} disabled={loading} title="Eliminar factura">🗑️</button>
                                            )}
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

            {showClientTypeModal && (
                <div className="modal-overlay">
                    <div className="modal-body client-type-modal">
                        <h3>Nueva Factura</h3>
                        <p className="client-type-text">¿Desea facturar a un cliente existente o registrar uno nuevo?</p>
                        <div className="client-type-buttons">
                            <button 
                                className="btn-primary" 
                                onClick={() => handleClientTypeSelection('existing')}
                            >
                                👤 Cliente Existente
                            </button>
                            <button 
                                className="btn-success" 
                                onClick={() => handleClientTypeSelection('new')}
                            >
                                ➕ Cliente Nuevo
                            </button>
                            <button className="btn-danger client-type-cancel" onClick={() => setShowClientTypeModal(false)}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

        <InvoiceStatusModal 
            invoice={selectedInvoice} 
            isOpen={showStatusModal} 
            onClose={() => setShowStatusModal(false)}
            onStatusChange={handleStatusChange}
        />

        </div>
    );
}

export default Facturas;