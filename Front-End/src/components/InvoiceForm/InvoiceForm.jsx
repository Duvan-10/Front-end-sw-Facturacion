import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const InvoiceForm = () => { 
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

    // --- ESTADOS ---
    const [loading, setLoading] = useState(false);
    const [pagoRealizado, setPagoRealizado] = useState('Default');
    const [numeroFactura, setNumeroFactura] = useState(isEditing ? 'Cargando...' : 'Auto-generado');
    const [fechaEmision, setFechaEmision] = useState(new Date().toISOString().substring(0, 10));
    const [cliente, setCliente] = useState({ id: '', identificacion: '', nombre_razon_social: '', telefono: '', direccion: '', email: '' });
    const [productos, setProductos] = useState([{ producto_id: "", code: "", cant: 1, detail: "", unit: 0, total: 0 }]);

    // --- 1. CARGA DE DATOS PARA EDICIÓN ---
    useEffect(() => {
        const fetchDatosFactura = async () => {
            if (isEditing && id) {
                try {
                    const token = sessionStorage.getItem('authToken');
                    const response = await fetch(`${apiBaseUrl}/facturas/${id}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setNumeroFactura(data.numero_factura || `ID: ${id}`);
                        
                        // Mapeo: Contado -> Si | Crédito -> No
                        const valorPago = data.pago === 'pago' ? 'Si' : 'No';
                        setPagoRealizado(valorPago);

                        setCliente(data.cliente);
                        setProductos(data.detalles || []);

                        if (data.fecha_emision) {
                            setFechaEmision(data.fecha_emision.split('T')[0]);
                        }
                    }
                } catch (err) {
                    console.error("Error cargando datos de edición:", err);
                    setNumeroFactura("Error al cargar");
                }
            }
        };
        fetchDatosFactura();
    }, [id, isEditing, apiBaseUrl]);

    // --- 2. LÓGICA DE BÚSQUEDA DE CLIENTE ---
    const buscarCliente = async (identificacion) => {
        if (!identificacion) return;
        try {
            const token = sessionStorage.getItem('authToken');
            const response = await fetch(`${apiBaseUrl}/clientes/identificacion/${identificacion}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setCliente(data);
            } else {
                alert("❌ Cliente no encontrado. Por favor, regístrelo primero.");
                setCliente({ id: '', identificacion: '', nombre_razon_social: '', telefono: '', direccion: '', email: '' });
            }
        } catch (err) {
            console.error("Error al buscar cliente:", err);
        }
    };

    // --- 3. LÓGICA DE PRODUCTOS ---
    const handleProductChange = async (index, field, value) => {
        setProductos(prevProductos => {
            const newProducts = [...prevProductos];
            newProducts[index][field] = value;

            if (field === "code") {
                newProducts[index].producto_id = "";
                newProducts[index].detail = value.length >= 3 ? "Buscando..." : "";
            }

            const cant = parseFloat(newProducts[index].cant) || 0;
            const unit = parseFloat(newProducts[index].unit) || 0;
            newProducts[index].total = cant * unit;
            return newProducts;
        });

        if (field === "code" && value.length >= 3) {
            try {
                const token = sessionStorage.getItem('authToken');
                const response = await fetch(`${apiBaseUrl}/productos/codigo/${value}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const prod = await response.json();
                    setProductos(prev => {
                        const updated = [...prev];
                        if (updated[index].code === value) {
                            updated[index].producto_id = prod.id;
                            updated[index].detail = prod.descripcion; 
                            updated[index].unit = prod.precio;
                            updated[index].total = (parseFloat(updated[index].cant) || 0) * prod.precio;
                        }
                        return updated;
                    });
                } else {
                    setProductos(prev => {
                        const updated = [...prev];
                        if (updated[index].code === value) {
                            updated[index].detail = "❌ NO ENCONTRADO";
                            updated[index].producto_id = "";
                        }
                        return updated;
                    });
                }
            } catch (err) {
                console.error("Error buscando producto:", err);
            }
        }
    };

    // --- 4. CÁLCULO DE TOTALES ---
    const calcularTotales = () => {
        const subtotal = productos.reduce((acc, p) => acc + (p.total || 0), 0);
        const iva = subtotal * 0.19;
        const totalFinal = subtotal + iva;
        return { subtotal, iva, totalFinal };
    };

    const { subtotal, iva, totalFinal } = calcularTotales();

    // --- 5. ENVÍO AL BACKEND ---
    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (pagoRealizado === 'Default') {
            alert("⚠️ Por favor, elige si el pago se realizó (Si o No).");
            return;
        }

        if (!cliente.id) {
            alert("⚠️ Seleccione un cliente válido.");
            return;
        }

        if (productos.some(p => !p.producto_id)) {
            alert("⚠️ Hay productos no válidos en la lista.");
            return;
        }

        setLoading(true);
        const token = sessionStorage.getItem('authToken');

        const facturaData = {
            cliente_id: cliente.id,
            pago_confirmado: pagoRealizado,
            fecha_emision: fechaEmision,
            subtotal,
            iva,
            total: totalFinal,
            detalles: productos 
        };

        try {
            const url = isEditing ? `${apiBaseUrl}/facturas/${id}` : `${apiBaseUrl}/facturas`;
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(facturaData)
            });

            if (response.ok) {
                alert(isEditing ? `✅ Factura actualizada` : `✅ Factura creada`);
                navigate('/home/facturas');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || "Error en el servidor");
            }
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="app-form card" onSubmit={handleFormSubmit}> 
            <h2 className="module-title">
                {isEditing ? `Editar Factura: ${numeroFactura}` : 'Registrar Nueva Factura'}
            </h2> 
            
            <div className="section-group header-fields">
                <div className="field-col Option-Page"> 
                    <label>PAGO:</label>
                    <div className="radio-group-horizontal">
                        <label className={`radio-label-inline ${pagoRealizado === 'Default' ? 'selected-default' : ''}`}>
                            <input type="radio" name="pagoEstado" value="Default" checked={pagoRealizado === 'Default'} onChange={(e) => setPagoRealizado(e.target.value)} /> Default
                        </label>
                        <label className={`radio-label-inline ${pagoRealizado === 'Si' ? 'selected-si' : ''}`}>
                            <input type="radio" name="pagoEstado" value="Si" checked={pagoRealizado === 'Si'} onChange={(e) => setPagoRealizado(e.target.value)} /> Si
                        </label>
                        <label className={`radio-label-inline ${pagoRealizado === 'No' ? 'selected-no' : ''}`}>
                            <input type="radio" name="pagoEstado" value="No" checked={pagoRealizado === 'No'} onChange={(e) => setPagoRealizado(e.target.value)} /> No
                        </label>
                    </div>
                </div>

                <div className="field-col">
                    <label>Número de Factura</label>
                    <input type="text" className="input-short" value={numeroFactura} disabled />
                </div>

                <div className="field-col">
                    <label htmlFor="fecha-emision">Fecha</label>
                    <input type="date" id="fecha-emision" className="input-short" value={fechaEmision} onChange={(e) => setFechaEmision(e.target.value)} />
                </div>
            </div>
            
            <h2 className="section-title">2. Datos del Cliente</h2> 
            <div className="section-group client-data"> 
                <div className="field-col">
                    <label>NIT/CC (Enter para buscar)</label>
                    <input 
                        type="text" 
                        placeholder="Identificación" 
                        value={cliente?.identificacion || ''}
                        onChange={(e) => setCliente({...cliente, identificacion: e.target.value})}
                        onKeyDown={(e) => e.key === 'Enter' && buscarCliente(e.target.value)}
                    />
                </div>
                <div className="field-col">
                    <label>Razón Social / Nombre</label>
                    <input type="text" value={cliente?.nombre_razon_social || ""} readOnly placeholder="Nombre completo" />
                </div>
                <div className="field-col">
                    <label>Teléfono</label>
                    <input type="text" value={cliente?.telefono || ""} readOnly />
                </div>
                <div className="field-col">
                    <label>Dirección</label>
                    <input type="text" value={cliente?.direccion || ""} readOnly />
                </div>
            </div>
        
            <h2 className="section-title">3. Detalle de Productos</h2> 
            <div className="product-grid product-header">
                <span>Código</span><span>Cant.</span><span>Detalle</span><span>V.Unitario</span><span>V.Total</span><span></span>
            </div>

            {productos.map((p, idx) => (
                <div className="product-grid product-row" key={idx}>
                    <input type="text" placeholder="Cód." value={p.code} onChange={(e) => handleProductChange(idx, "code", e.target.value)} />
                    <input type="number" value={p.cant} onChange={(e) => handleProductChange(idx, "cant", e.target.value)} />
                    <input type="text" value={p.detail} readOnly />
                    <input type="number" value={p.unit} readOnly />
                    <input type="text" disabled value={p.total.toFixed(2)} />
                    <button type="button" className="delete-product" onClick={() => setProductos(productos.filter((_, i) => i !== idx))}>🗑</button>
                </div>
            ))}

            <button type="button" className="btn btn-primary btn-sm" onClick={() => setProductos([...productos, { producto_id: "", code: "", cant: 1, detail: "", unit: 0, total: 0 }])}>
                + Añadir Producto
            </button>

            <h2 className="section-title">4. Totales</h2> 
            <div className="totals-section">
                <div className="total-line"><label>Subtotal</label><span>${subtotal.toFixed(2)}</span></div>
                <br></br>
                 <br></br>
                  <br></br>
                <div className="total-line"><label>IVA (19%)</label><span>${iva.toFixed(2)}</span></div>
                 <br></br>
                  <br></br>
                   <br></br>
                <div className="total-line total-final"><label>Total</label><span>${totalFinal.toFixed(2)}</span></div>
            </div>
            
            <div className="final-buttons-group">
                <button type="submit" className="btn btn-success" disabled={loading}>
                    {loading ? 'Procesando...' : isEditing ? 'Guardar Cambios' : 'Crear Factura'}
                </button>
                <button type="button" className="btn btn-danger" onClick={() => navigate('/home/facturas')}>
                    Cancelar
                </button>
            </div>
        </form>
    );
};

export default InvoiceForm;