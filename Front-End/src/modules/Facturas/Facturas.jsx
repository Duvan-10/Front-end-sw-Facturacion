import React from 'react';
import './Facturas.css'; // Importamos los estilos

function InvoiceForm() {
    // Array simulado para las filas de productos (en un proyecto real, se manejaría con useState)
    const productRows = [
        { placeholder: 'Código del producto/servicio', cantPlaceholder: '0.5' },
        { placeholder: 'Código del producto/servicio', cantPlaceholder: 'min 1' }
    ];

    return (
        <div className="container">
            <header className="app-header">
                <h1 className="header-title">Factura Venta</h1>
            </header>

            <form className="invoice-form">
                
                {/* --- Número de Factura y Fecha --- */}
                <div className="section-group header-fields">
                    <div className="field-col">
                        <label htmlFor="num-factura">Número de Factura</label>
                        <input type="text" id="num-factura" name="num-factura" placeholder="fagin-factura" />
                    </div>
                    <div className="field-col">
                        <label htmlFor="fecha">Fecha</label>
                        <input type="text" id="fecha" name="fecha" placeholder="ferma-fecha" />
                    </div>
                </div>

                {/* --- Datos del Cliente --- */}
                <h2 className="section-title">Datos del Cliente</h2>
                <div className="section-group client-data">
                    <div className="field-col">
                        <label htmlFor="nit-cc">NIT/CC</label>
                        <input type="text" id="nit-cc" name="nit-cc" placeholder="Identificación cliente" />
                    </div>
                    <div className="field-col">
                        <label htmlFor="razon-social">Razón Social/Nombre</label>
                        <input type="text" id="razon-social" name="razon-social" placeholder="Nombre completo o la razón cliente" />
                    </div>
                    
                    <div className="field-col">
                        <label htmlFor="telefono">Teléfono</label>
                        <input type="text" id="telefono" name="telefono" placeholder="Número de contacto" />
                    </div>
                    <div className="field-col">
                        <label htmlFor="direccion">Dirección</label>
                        <input type="text" id="direccion" name="direccion" placeholder="Dirección residencia/sede" />
                    </div>

                    <div className="field-col">
                        <label htmlFor="correo">Correo</label>
                        <input type="email" id="correo" name="correo" placeholder="Dirección electrónica del cliente" />
                    </div>
                </div>

                {/* --- Productos Header --- */}
                <h2 className="section-title">Producto</h2>
                <div className="product-grid product-header">
                    <span className="code-col">Code</span>
                    <span className="cant-col">Cant.und</span>
                    <span className="detail-col">Detalles del Producto</span>
                    <span className="unit-col">V.Unitario</span>
                    <span className="total-col">V.Total</span>
                </div>

                {/* --- Filas de Productos (Usando map para repetición) --- */}
                {productRows.map((row, index) => (
                    <div className="product-grid product-row" key={index}>
                        <input type="text" placeholder={row.placeholder} className="code-col" />
                        <input type="text" placeholder={row.cantPlaceholder} className="cant-col" />
                        <input type="text" placeholder="Descripción del producto/servicio" className="detail-col" />
                        <input type="text" defaultValue="0.00" className="unit-col" />
                        <input type="text" defaultValue="vtotal" disabled className="total-col" />
                    </div>
                ))}
                
                {/* --- Totales --- */}
                <h2 className="section-title">Valor</h2>
                <div className="totals-section">
                    <div className="total-line">
                        <label>Subtotal: $</label>
                        <span id="subtotal" className="total-value">0.00</span>
                    </div>
                    <div className="total-line">
                        <label>Valor IVA (19%): $</label>
                        <span id="iva" className="total-value">0.00</span>
                    </div>
                    <div className="total-line total-final">
                        <label>Total: $</label>
                        <span id="total-final" className="total-value">0.00</span>
                    </div>
                </div>

                {/* --- Botón --- */}
                <div className="submit-button">
                    <button type="submit">Crear Factura</button>
                </div>
            </form>
        </div>
    );
}

export default InvoiceForm;