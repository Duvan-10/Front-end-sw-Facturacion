import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../styles1.css'; // Importa los estilos modulares actualizados

// =======================================================
// COMPONENTE: InvoiceForm (Ahora actúa como una página/ruta)
// =======================================================

const InvoiceForm = () => { 
    
    // --- NUEVO: Obtener el ID de la URL para edición ---
    const { id } = useParams(); // Obtiene el ID si estamos en modo edición
    const isEditing = !!id;

    // Simulación: Cargar datos si estamos editando
    const loadedData = isEditing ? 
        { 
            id: id, 
            clientName: `Cliente #${id}`, 
            tipoFactura: 'Crédito', 
            productos: [
                { code: "PROD-A", cant: "2", detail: "Servicio de consultoría", unit: "150.00", total: 300.00 },
                { code: "PROD-B", cant: "1", detail: "Licencia de software anual", unit: "500.00", total: 500.00 }
            ]
        } : 
        null;

    // ESTADOS DEL FORMULARIO: Usan loadedData si existe (edición)
    const [formData, setFormData] = useState(loadedData || {});
    const [tipoFactura, setTipoFactura] = useState(loadedData?.tipoFactura || 'Contado');
    
    // Estado clave para líneas de producto: array de objetos
    const [productos, setProductos] = useState(
        loadedData?.productos || [{ code: "", cant: "", detail: "", unit: "", total: 0 }]
    );

    // =======================================================
    // I. LÓGICA DE PRODUCTOS Y CÁLCULO DE TOTALES
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

        // Asegura que el total siempre se calcula
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
    
    const handleFormSubmit = (e) => {
        e.preventDefault();
        
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
        
        const action = isEditing ? 'editó' : 'registró';
        alert(`✅ Factura ${submissionId} ${action} con éxito. La pestaña se mantendrá abierta hasta que la cierre.`);
    };

    // Función para Cerrar la Pestaña Manualmente
    const handleCloseTab = () => {
        window.close();
    };

    
    return (
        // 🚨 CAMBIO 1: Usar la clase global 'app-form'
        <form className="app-form card" onSubmit={handleFormSubmit}> 
            
            <h2 className="module-title">
                {isEditing ? `Editar Factura #${id}` : 'Registrar Nueva Factura'}
            </h2> 
            
            {/* ------------------------------------------------------------- */}
            {/* 1. Encabezado (Ya usa la estructura .section-group) */}
            {/* ------------------------------------------------------------- */}
            
            <div className="section-group header-fields">
                
                {/* Campo 1: Tipo de Factura (Unidad independiente) */}
                <div className="field-col"> 
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
                
                {/* Campo 2: Número de Factura (Unidad independiente) */}
                <div className="field-col">
                    <label htmlFor="num-factura">Número de Factura</label>
                    <input 
                        type="text" 
                        id="num-factura" 
                        className="input-short" 
                        placeholder="fagin-factura" 
                        defaultValue={id || ''} 
                        disabled={isEditing} 
                    />
                </div>

                {/* Campo 3: Fecha (Unidad independiente) */}
                <div className="field-col">
                    <label htmlFor="fecha-emision">Fecha</label>
                    <input 
                        type="date" 
                        id="fecha-emision" 
                        className="input-short" 
                        defaultValue={loadedData?.date || new Date().toISOString().substring(0, 10)} 
                    />
                </div>
            </div>
            
            
            {/* ------------------------------------------------------------- */}
            {/* 2. Datos del Cliente (Ya usaba la estructura .section-group) */}
            {/* ------------------------------------------------------------- */}
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
                <div className="field-col"></div> {/* Columna de relleno para mantener el grid */}
            </div>
        
            {/* ------------------------------------------------------------- */}
            {/* 3. Detalle de Productos (Usa Grid, no .field-col) */}
            {/* ------------------------------------------------------------- */}
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


        
            {/* ---------4. TOTALES DE LA FACTURA---------------------- */}
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
            {/* 🚨 CAMBIO 2: Usar la clase global 'final-buttons-group' y eliminar style inline */}
            <div className="final-buttons-group">
                <button 
                    type="submit" 
                    className="btn btn-success" 
                    style={{ width: '200px' }}
                >
                    {isEditing ? 'Guardar Cambios' : 'Crear Factura'}
                </button>
                
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