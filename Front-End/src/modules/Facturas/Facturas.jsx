import React, { useState, useEffect } from 'react'; 
// Asegúrate de que Facturas.css está importado en algún lugar

// =======================================================
// DATOS Y CONSTANTES (Simulación)
// =======================================================

const initialInvoices = [
    { id: 'FAC-001', client: 'Tech Solutions Corp', date: '2025-11-20', total: 1500.00, status: 'Pagada', clientEmail: 'tech@corp.com', tipoFactura: 'Contado' },
    { id: 'FAC-002', client: 'Innova Retail S.A.', date: '2025-11-25', total: 350.50, status: 'Pendiente', clientEmail: 'innova@retail.com', tipoFactura: 'Crédito' },
    { id: 'FAC-003', client: 'Logistics Pro', date: '2025-12-01', total: 890.75, status: 'Pendiente', clientEmail: 'logis@pro.co', tipoFactura: 'Crédito' },
    { id: 'FAC-004', client: 'Home Supplies Ltda', date: '2025-12-05', total: 120.00, status: 'Pagada', clientEmail: 'home@supplies.net', tipoFactura: 'Contado' },
];

const ITEMS_PER_PAGE = 30; 

// =======================================================
// COMPONENTE PRINCIPAL: FACTURAS
// =======================================================

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

    // **ESTADOS ELIMINADOS: isFormVisible y editingInvoiceData ya no se usan**
    
    // =======================================================
    // I. LÓGICA DE CARGA Y FILTRADO (Se mantiene)
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
    // II. HANDLERS DE NAVEGACIÓN Y CRUD
    // =======================================================
    
    // Handler para cambios en la búsqueda (se mantiene)
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); 
    };

    // --- NUEVO HANDLER: Crear Factura (Abre Pestaña Nueva) ---
    const handleCreateNew = () => {
        // Abre la ruta de creación en una nueva pestaña
        window.open('/facturas/crear', '_blank'); 
    };
    
    // --- NUEVO HANDLER: Editar Factura (Abre Pestaña Nueva) ---
    const handleEdit = (invoice) => {
        // Abre la ruta de edición en una nueva pestaña, pasando el ID
        window.open(`/facturas/editar/${invoice.id}`, '_blank');
    };
    
    // Handler de visualización (se mantiene)
    const handleView = (invoice) => {
        alert(`Simulando: Generar PDF de la Factura ${invoice.id}.`);
    };
    
    // Handler de emisión (se mantiene)
    const handleEmit = (invoice) => {
        alert(`Simulando: Emitir Factura ${invoice.id}.`);
    };

    // El handleSubmitInvoice ya no es necesario aquí si la persistencia ocurre en InvoiceForm
    // Si necesitas manejar el resultado de una llamada API del formulario, tendrías que usar otro mecanismo (ej. Redux, Context, o un Event Bus).
    
    // =======================================================
    // III. RENDERIZADO
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
                    className="btn btn-primary btn-register-invoice" 
                    onClick={handleCreateNew} // <--- Llama a la nueva función de pestaña
                >
                    Crear Nueva Factura
                </button>
            </section>
            
            <hr/>

            {/* **SECCIÓN DE FORMULARIO ELIMINADA** */}
            {/* Si antes tenías: {isFormVisible && (<section>...</section>)} ya NO debe estar aquí */}
            
            
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
                                            <button className="btn btn-sm btn-edit" onClick={() => handleEdit(invoice)}>Editar</button> {/* <--- Llama a la nueva función de pestaña */}
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
                                {/* Componente de paginación iría aquí */}
                            </div>
                        )}
                    </>
                )}
            </section>
        </div>
    );
}

export default Facturas;