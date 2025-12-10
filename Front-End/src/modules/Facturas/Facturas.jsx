import React, { useState, useEffect } from 'react'; 

// API y Constantes (Simulación)
const API_URL = 'http://localhost:3000/api/facturas'; 
const ITEMS_PER_PAGE = 30; 

// Datos simulados iniciales para desarrollo
const initialInvoices = [
    { id: 'FAC-001', client: 'Tech Solutions Corp', date: '2025-11-20', total: 1500.00, status: 'Pagada', clientEmail: 'tech@corp.com', tipoFactura: 'Contado' },
    { id: 'FAC-002', client: 'Innova Retail S.A.', date: '2025-11-25', total: 350.50, status: 'Pendiente', clientEmail: 'innova@retail.com', tipoFactura: 'Crédito' },
    { id: 'FAC-003', client: 'Logistics Pro', date: '2025-12-01', total: 890.75, status: 'Pendiente', clientEmail: 'logis@pro.co', tipoFactura: 'Crédito' },
    { id: 'FAC-004', client: 'Home Supplies Ltda', date: '2025-12-05', total: 120.00, status: 'Pagada', clientEmail: 'home@supplies.net', tipoFactura: 'Contado' },
];

function Facturas() {
    // 1. Estados principales
    const [invoices, setInvoices] = useState(initialInvoices); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 2. Estados para Búsqueda y Paginación
    const [searchQuery, setSearchQuery] = useState(''); 
    const [filterState, setFilterState] = useState(''); 
    const [currentPage, setCurrentPage] = useState(1); 
    const [totalItems, setTotalItems] = useState(initialInvoices.length); 

    // 3. Control de UI y Edición
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingInvoiceData, setEditingInvoiceData] = useState(null); 
    
    // =======================================================
    // I. LÓGICA DE CARGA Y FILTRADO (Simulación)
    // =======================================================
    
    const getFilteredInvoices = () => {
        let filtered = initialInvoices; 
        if (filterState) {
            filtered = filtered.filter(inv => inv.status === filterState);
        }
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(inv => 
                inv.id.toLowerCase().includes(query) ||
                inv.client.toLowerCase().includes(query) ||
                inv.date.includes(query) 
            );
        }
        
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const pagedInvoices = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

        setTotalItems(filtered.length);
        setInvoices(pagedInvoices);
    };

    useEffect(() => {
        getFilteredInvoices();
    }, [searchQuery, filterState, currentPage]); 

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);


    // =======================================================
    // II. HANDLERS DE UI
    // =======================================================
    
    const handleToggleForm = (invoiceToEdit = null) => {
        if (invoiceToEdit) {
            setEditingInvoiceData(invoiceToEdit);
            setIsFormVisible(true);
        } else {
            setIsFormVisible(!isFormVisible);
            setEditingInvoiceData(null);
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); 
    };
    
    // ... (handlePageChange y otros handlers se mantienen) ...


    // =======================================================
    // III. FUNCIONALIDAD DE ACCIONES (Placeholders)
    // =======================================================
    
    const handleView = (invoice) => {
        alert(`Simulando: Generar PDF de la Factura ${invoice.id} y abrir en una nueva pestaña.`);
    };

    const handleEdit = (invoice) => {
        handleToggleForm(invoice); 
        alert(`Cargando datos de Factura ${invoice.id} para edición en el formulario.`);
    };

    const handleEmit = (invoice) => {
        alert(`Simulando: Emitir Factura ${invoice.id}. PDF enviado al correo: ${invoice.clientEmail} y descarga iniciada.`);
    };

    const handleSubmitInvoice = (data) => {
        console.log("Datos de la factura a guardar/crear:", data);
        alert(`Factura ${data.id ? 'editada' : 'creada'} con éxito.`);
        handleToggleForm(null); // Cerrar formulario al guardar
    };

    // =======================================================
    // IV. RENDERIZADO
    // =======================================================

    return (
        <div className="main-content">
            <h1 className="module-title">Gestión de Facturas</h1>

            {/* --- 1. Controles de Búsqueda y Botón de Registro --- */}
            <section className="controls-section card">
                <div className="search-bar">
                    <label htmlFor="search">Buscar Factura (Número, Cliente, Fecha):</label>
                    <input 
                        type="text" 
                        id="search"
                        className="search-input" 
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Buscar por # Factura, Cliente, o Fecha..."
                    />
                </div>
                
                {/* Filtro por Estado */}
                <select 
                    value={filterState} 
                    onChange={(e) => { setFilterState(e.target.value); setCurrentPage(1); }} 
                    className="select-filter form-control" 
                >
                    <option value="">Todos los Estados</option>
                    <option value="Pagada">Pagada</option>
                    <option value="Pendiente">Pendiente</option>
                </select>
                
                <button 
                    className={`btn ${isFormVisible ? 'btn-danger' : 'btn-primary'} btn-register-invoice`} 
                    onClick={() => handleToggleForm(null)}
                >
                    {isFormVisible ? 'Cancelar Creación' : 'Crear Nueva Factura'}
                </button>
            </section>
            
            <hr/>

            {/* --- 2. Formulario de Creación/Edición (Oculto) --- */}
            {isFormVisible && (
                 <section className="form-section card">
                    <h2>{editingInvoiceData ? `Editar Factura #${editingInvoiceData.id}` : 'Registrar Nueva Factura'}</h2>
                    <InvoiceForm 
                        initialData={editingInvoiceData} 
                        onCancel={() => handleToggleForm(null)}
                        onSubmit={handleSubmitInvoice} 
                    />
                 </section>
            )}
            
            
            {/* --- 3. Listado de Facturas (Tabla) --- */}
            <section className="list-section">
                <h2>Listado de Facturas ({totalItems} en total)</h2>

                {loading && <p className="loading-message">Cargando facturas...</p>}
                {error && <p className="error-message">{error}</p>}

                {!loading && invoices.length > 0 && (
                    <>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th># Factura</th>
                                    <th>Cliente</th>
                                    <th>Tipo</th>
                                    <th>Total</th>
                                    <th>Acciones</th> 
                                    <th>Estado</th> 
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((invoice) => (
                                    <tr key={invoice.id}>
                                        <td>{invoice.id}</td>
                                        <td>{invoice.client}</td>
                                        <td>{invoice.tipoFactura}</td>
                                        <td>${parseFloat(invoice.total).toFixed(2)}</td>
                                        <td className="actions-cell">
                                            <button className="btn btn-sm btn-primary" onClick={() => handleView(invoice)}>Ver</button>
                                            <button className="btn btn-sm btn-edit" onClick={() => handleEdit(invoice)}>Editar</button>
                                            <button className="btn btn-sm btn-success" onClick={() => handleEmit(invoice)}>Emitir</button>
                                        </td>
                                        <td>
                                            <span className={`invoice-status status-${invoice.status.toLowerCase()}`}>
                                                {invoice.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {/* Paginación */}
                        {totalPages > 1 && (
                            <div className="pagination-controls">
                                {/* Botones de paginación */}
                            </div>
                        )}
                    </>
                )}
            </section>
        </div>
    );
}

export default Facturas;

// -------------------------------------------------------------
// Componente Formulario de Factura (FINAL Y CORREGIDO)
// -------------------------------------------------------------
const InvoiceForm = ({ initialData, onCancel, onSubmit }) => {
    
    const [formData, setFormData] = useState(initialData || {});
    const [tipoFactura, setTipoFactura] = useState(initialData?.tipoFactura || 'Contado');

    const handlePaymentType = (type) => {
        setTipoFactura(type);
    };
    
    const handleFormSubmit = (e) => {
        e.preventDefault();
        const finalData = { 
            ...formData, 
            tipoFactura, 
            id: initialData?.id || `FAC-${Math.floor(Math.random() * 1000)}` 
        };
        onSubmit(finalData);
    }

    return (
        <form className="invoice-form card" onSubmit={handleFormSubmit}> 
            
            <h2 className="module-title" style={{ textAlign: 'center' }}>Factura Venta</h2> 
            
            {/* ======================================================= */}
            /* 1. TIPO DE FACTURA Y ENCABEZADO (2 Columnas) - CORREGIDO */
            {/* ======================================================= */}
            <h2 className="section-title">1. Encabezado</h2> 

            {/* Grupo GRID de 2 columnas para Tipo/Número vs. Fecha */}
            <div className="section-group header-fields">
                <div className="field-col">
                    {/* Lado Izquierdo: Tipo Factura y Número de Factura */}
                    <div style={{ marginBottom: '15px' }}> 
                        <label style={{ marginBottom: '0' }}>Tipo Factura:</label>
                        <div className="radio-group" style={{ display: 'flex', gap: '20px', marginTop: '5px' }}>
                            <label className="radio-label">
                                <input type="radio" name="tipoFactura" value="Contado" checked={tipoFactura === 'Contado'} onChange={() => handlePaymentType('Contado')} />
                                Contado
                            </label>
                            <label className="radio-label">
                                <input type="radio" name="tipoFactura" value="Crédito" checked={tipoFactura === 'Crédito'} onChange={() => handlePaymentType('Crédito')} />
                                Crédito
                            </label>
                        </div>
                    </div>

                    {/* Número de Factura integrado y corto */}
                    <div>
                        <label htmlFor="num-factura">Número de Factura:</label>
                        <input type="text" id="num-factura" className="input-short" placeholder="FAC-XXXX" defaultValue={initialData?.id || ''} />
                    </div>
                </div>
                
                <div className="field-col">
                    {/* Lado Derecho: Fecha (alineado verticalmente con el Número de Factura) */}
                    <label htmlFor="fecha-emision">Fecha:</label>
                    <input type="date" id="fecha-emision" className="input-short" defaultValue={initialData?.date || new Date().toISOString().substring(0, 10)} />
                </div>
            </div>
            
            {/* ======================================================= */}
            /* 2. DATOS DEL CLIENTE (3 Columnas) */
            {/* ======================================================= */}
            <h2 className="section-title">2. Datos del Cliente</h2> 
            <div className="section-group client-data"> 
                <div className="field-col">
                    <label htmlFor="nit-cc">NIT/CC:</label>
                    <input type="text" id="nit-cc" placeholder="Identificación cliente" />
                </div>
                <div className="field-col">
                    <label htmlFor="razon-social">Razón Social/Nombre:</label>
                    <input type="text" id="razon-social" placeholder="Nombre o Razón social" />
                </div>
                <div className="field-col">
                    <label htmlFor="telefono">Teléfono:</label>
                    <input type="text" id="telefono" placeholder="Número de contacto" />
                </div>
                <div className="field-col">
                    <label htmlFor="correo">Correo:</label>
                    <input type="email" id="correo" placeholder="Dirección electrónica" />
                </div>
                <div className="field-col">
                    <label htmlFor="direccion">Dirección Residencia:</label>
                    <input type="text" id="direccion" placeholder="Dirección física del cliente" />
                </div>
                <div className="field-col"></div> 
            </div>
            
            {/* ======================================================= */
            /* 3. DETALLE DE PRODUCTOS (5 Columnas) */
            /* ======================================================= */}
            <h2 className="section-title">3. Detalle de Productos</h2> 
            
            {/* Encabezado del Grid de Productos */}
            <div className="product-grid product-header">
                <span>Code</span>
                <span>Unidades</span> 
                <span>Detalles Producto</span> 
                <span>V.Unitario</span>
                <span>V.Total</span>
            </div>

            {/* Fila de Ejemplo */}
            <div className="product-grid product-row">
                <input type="text" placeholder="Cód." />
                <input type="number" placeholder="Cant." />
                <input type="text" placeholder="Descripción detallada" />
                <input type="number" step="0.01" defaultValue="0.00" />
                <input type="text" defaultValue="0.00" disabled /> 
            </div>
            
            <button type="button" className="btn btn-primary btn-sm" style={{ width: '200px', margin: '15px 0' }}>
                + Añadir Producto
            </button>


            {/* ======================================================= */}
            /* 4. TOTALES DE LA FACTURA (Alineación Derecha - Estilo Recibo) */
            {/* ======================================================= */}
            <h2 className="section-title" style={{ borderBottom: 'none', marginBottom: '10px' }}>4. Totales de la Factura</h2> 
            <div className="totals-section">
                <div className="total-line">
                    <label>Subtotal: $</label>
                    <span id="subtotal">{parseFloat(0).toFixed(2)}</span>
                </div>
                <div className="total-line">
                    <label>IVA (19%): $</label>
                    <span id="iva">{parseFloat(0).toFixed(2)}</span>
                </div>
                <div className="total-line">
                    <label>Total: $</label>
                    <span id="total">{parseFloat(0).toFixed(2)}</span>
                </div>
            </div>
            
            {/* Botones Finales: Crear Factura y Cerrar */}
            <div className="final-buttons-group" style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '30px' }}>
                <button 
                    type="submit" 
                    className="btn btn-success" 
                    style={{ width: '200px' }}
                >
                    Crear Factura
                </button>
                <button 
                    type="button" 
                    className="btn btn-danger" 
                    onClick={onCancel} 
                    style={{ width: '200px' }}
                >
                    Cerrar
                </button>
            </div>
        </form>
    );
};