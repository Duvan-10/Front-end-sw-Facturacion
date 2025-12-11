import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Necesitas este hook para obtener el ID de la URL

// =======================================================
// COMPONENTE: InvoiceForm (Ahora actúa como una página/ruta)
// =======================================================

// Eliminamos 'initialData', 'onCancel', y 'onSubmit' de los props, 
// ya que la lógica de carga y guardado es auto-contenida en esta ruta.
const InvoiceForm = () => { 
    
    // --- NUEVO: Obtener el ID de la URL para edición ---
    const { id } = useParams(); // Obtiene 'FAC-00X' si estamos en /facturas/editar/FAC-00X
    const isEditing = !!id;

    // Simulación: Cargar datos si estamos editando
    // En un proyecto real, usarías useEffect y el 'id' para hacer una llamada a la API y setear los estados
    const loadedData = isEditing ? 
        { id: id, clientName: `Cliente #${id}`, tipoFactura: 'Crédito' } : 
        null;

    // ESTADOS DEL FORMULARIO: Usan loadedData si existe (edición)
    const [formData, setFormData] = useState(loadedData || {});
    const [tipoFactura, setTipoFactura] = useState(loadedData?.tipoFactura || 'Contado');
    // Estado clave para líneas de producto: array de objetos
    const [productos, setProductos] = useState(
        loadedData?.productos || [{ code: "", cant: "", detail: "", unit: "", total: 0 }]
    );

    // =======================================================
    // I. LÓGICA DE PRODUCTOS Y CÁLCULO DE TOTALES (Se mantiene)
    // =======================================================
    
    // Función de cálculo de subtotales, IVA (19%) y total final
    const calcularTotales = () => {
        const subtotal = productos.reduce(
            (acc, p) => acc + (parseFloat(p.total) || 0),
            0
        );
        const IVA_RATE = 0.19; 
        const iva = subtotal * IVA_RATE;
        const totalFinal = subtotal + iva;
        return { subtotal, iva, totalFinal };
    };

    // Handler para cambios en las líneas de producto (actualiza el total de la línea)
    const handleProductChange = (index, field, value) => {
        const updated = [...productos];
        updated[index][field] = value;

        const cant = parseFloat(updated[index].cant) || 0;
        const unit = parseFloat(updated[index].unit) || 0;

        updated[index].total = cant * unit;

        setProductos(updated);
    };

    // Añadir una nueva línea vacía
    const addProduct = () => {
        setProductos([
            ...productos,
            { code: "", cant: "", detail: "", unit: "", total: 0 },
        ]);
    };

    // Eliminar una línea por índice
    const deleteProduct = (index) => {
        const updated = productos.filter((_, i) => i !== index);
        setProductos(updated);
    };
    
    // Obtener los totales calculados para renderizar
    const { subtotal, iva, totalFinal } = calcularTotales();


    // =======================================================
    // II. HANDLERS GENERALES
    // =======================================================
    
    const handlePaymentType = (type) => {
        setTipoFactura(type);
    };
    
    // --- MODIFICADO: Muestra alerta y no cierra la pestaña ---
    const handleFormSubmit = (e) => {
        e.preventDefault();
        
        // Determinar ID para el mensaje
        const submissionId = id || `FAC-${Math.floor(Math.random() * 1000)}`;

        const finalData = { 
            ...formData, 
            tipoFactura, 
            productos,
            totales: { subtotal, iva, totalFinal },
            id: submissionId
        };

        // Simulación: Envío de datos a la API (o a la consola)
        console.log("Datos de la factura a guardar:", finalData);
        
        // Mostrar mensaje de confirmación
        const action = isEditing ? 'editó' : 'registró';
        alert(`✅ Factura ${submissionId} ${action} con éxito. La pestaña se mantendrá abierta hasta que la cierre.`);

        // IMPORTANTE: NO CERRAMOS LA PESTAÑA NI HACEMOS REDIRECCIÓN AQUÍ.
        // El formulario queda abierto para revisión.
    };

    // --- NUEVO: Función para Cerrar la Pestaña Manualmente ---
    const handleCloseTab = () => {
        // Esta función cierra la ventana o pestaña actual del navegador.
        window.close();
    };

    // El handler 'cancelar' original ya no es necesario o debe ser handleCloseTab
    
    return (
        // El componente usa la clase 'invoice-form card' para aplicar los estilos modulares
        <form className="invoice-form card" onSubmit={handleFormSubmit}> 
            
            <h2 className="module-title">
                {isEditing ? `Editar Factura #${id}` : 'Registrar Nueva Factura'}
            </h2> 
            
            {/* ... Resto del Formulario (TIPO DE FACTURA, DATOS CLIENTE, DETALLE DE PRODUCTOS, TOTALES) se mantiene igual ... */}
            
            {/* TIPO DE FACTURA */}
            <h2 className="section-title"></h2> 
            <div className="section-group header-fields">
                <div className="field-col">
                    {/* Tipo Factura (Radio Buttons) */}
                    <div> 
                        <label>Tipo Factura:</label>
                        <div className="radio-group">
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

                    {/* Número de Factura */}
                    <div>
                        <label htmlFor="num-factura">Número de Factura</label>
                        <input type="text" id="num-factura" className="input-short" placeholder="fagin-factura" defaultValue={id || ''} disabled={isEditing} />
                    </div>
                </div>
                
                <div className="field-col">
                    {/* Fecha */}
                    <label htmlFor="fecha-emision">Fecha</label>
                    <input type="date" id="fecha-emision" className="input-short" defaultValue={loadedData?.date || new Date().toISOString().substring(0, 10)} />
                </div>
            </div>
            
            {/* ======================================================= */}
            /* 2. DATOS DEL CLIENTE */
            {/* ======================================================= */}
            <h2 className="section-title">2. Datos del Cliente</h2> 
            <div className="section-group client-data"> 
                <div className="field-col">
                    <label htmlFor="nit-cc">NIT/CC</label>
                    <input type="text" id="nit-cc" placeholder="Identificación" />
                </div>
                <div className="field-col">
                    <label htmlFor="razon-social">Razón Social / Nombre</label>
                    <input type="text" id="razon-social" placeholder="Nombre completo" />
                </div>
                <div className="field-col">
                    <label htmlFor="telefono">Teléfono</label>
                    <input type="text" id="telefono" placeholder="Número contacto" />
                </div>
                <div className="field-col">
                    <label htmlFor="direccion">Dirección</label>
                    <input type="text" id="direccion" placeholder="Dirección" />
                </div>
                <div className="field-col">
                    <label htmlFor="correo">Correo</label>
                    <input type="email" id="correo" placeholder="Correo electrónico" />
                </div>
                <div className="field-col"></div> 
            </div>
            
            {/* ======================================================= */}
            /* 3. DETALLE DE PRODUCTOS (Líneas dinámicas) */
            {/* ======================================================= */}
            <h2 className="section-title">3. Detalle de Productos</h2> 
            
            {/* Encabezado del Grid */}
            <div className="product-grid product-header">
                <span>Code</span>
                <span>Cant.</span>
                <span>Detalle</span>
                <span>V.Unitario</span>
                <span>V.Total</span>
                <span>Acción</span>
            </div>

            {/* Iteración de productos */}
            {productos.map((p, idx) => (
                <div className="product-grid product-row" key={idx}>
                    <input
                        type="text"
                        placeholder="Código"
                        value={p.code}
                        onChange={(e) => handleProductChange(idx, "code", e.target.value)}
                    />
                    <input
                        type="number" 
                        placeholder="0"
                        value={p.cant}
                        onChange={(e) => handleProductChange(idx, "cant", e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Descripción detallada"
                        value={p.detail}
                        onChange={(e) => handleProductChange(idx, "detail", e.target.value)}
                    />
                    <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={p.unit}
                        onChange={(e) => handleProductChange(idx, "unit", e.target.value)}
                    />
                    <input type="text" disabled value={p.total.toFixed(2)} />

                    <button
                        type="button"
                        className="delete-product"
                        onClick={() => deleteProduct(idx)}
                    >
                        🗑
                    </button>
                </div>
            ))}

            {/* BOTÓN AÑADIR */}
            <button type="button" className="btn btn-primary btn-sm" onClick={addProduct}>
                + Añadir Producto
            </button>


            {/* ======================================================= */}
            /* 4. TOTALES DE LA FACTURA */
            {/* ======================================================= */}
            <h2 className="section-title">4. Valor</h2> 
            <div className="totals-section">
                <div className="total-line">
                    <label>Subtotal: $</label>
                    <span id="subtotal">{subtotal.toFixed(2)}</span>
                </div>
                <div className="total-line">
                    <label>IVA (19%): $</label>
                    <span id="iva">{iva.toFixed(2)}</span>
                </div>
                <div className="total-line total-final">
                    <label>Total: $</label>
                    <span id="total">{totalFinal.toFixed(2)}</span>
                </div>
            </div>
            
            {/* Botones Finales */}
            <div className="final-buttons-group" style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '30px' }}>
                <button 
                    type="submit" 
                    className="btn btn-success" 
                    style={{ width: '200px' }}
                >
                    {isEditing ? 'Guardar Cambios' : 'Crear Factura'}
                </button>
                
                {/* --- NUEVO BOTÓN: Cierre Manual --- */}
                <button 
                    type="button" 
                    className="btn btn-danger" 
                    onClick={handleCloseTab} 
                    style={{ width: '200px' }}
                >
                    Cerrar Pestaña
                </button>
            </div>
        </form>
    );
};

export default InvoiceForm;

