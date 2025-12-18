import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles1.css';

const InvoiceForm = () => { 
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

    // ESTADOS
    const [loading, setLoading] = useState(false);
    const [tipoFactura, setTipoFactura] = useState('Contado');
    const [numeroFactura, setNumeroFactura] = useState('Cargando...'); // <--- NUEVO ESTADO
    const [cliente, setCliente] = useState({ id: '', identificacion: '', nombre_razon_social: '', telefono: '', direccion: '', email: '' });
    const [productos, setProductos] = useState([{ producto_id: "", code: "", cant: 1, detail: "", unit: 0, total: 0 }]);

    // 🚨 SEGURIDAD Y CARGA INICIAL
    useEffect(() => {
        const token = sessionStorage.getItem('authToken');
        if (!token) {
            navigate('/');
            return;
        }

        // TRAER EL PRÓXIMO NÚMERO DE FACTURA
        const fetchNextNumber = async () => {
            try {
                const response = await fetch(`${apiBaseUrl}/facturas/proximo-numero`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setNumeroFactura(data.numero_factura); // Ej: "FAC-0005"
                }
            } catch (err) {
                console.error("Error al obtener el número correlativo");
            }
        };

        if (!isEditing) {
            fetchNextNumber();
        }
    }, [navigate, apiBaseUrl, isEditing]);

    // =======================================================
    // LÓGICA DE BÚSQUEDA DE CLIENTE POR NIT
    // =======================================================
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
            }
        } catch (err) {
            console.error("Cliente no encontrado");
        }
    };

    // =======================================================
    // LÓGICA DE PRODUCTOS
    // =======================================================
    const handleProductChange = async (index, field, value) => {
        const updated = [...productos];
        updated[index][field] = value;

        if (field === "code" && value.length > 2) {
            try {
                const token = sessionStorage.getItem('authToken');
                const response = await fetch(`${apiBaseUrl}/productos/codigo/${value}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const prod = await response.json();
                    updated[index].producto_id = prod.id;
                    updated[index].detail = prod.nombre;
                    updated[index].unit = prod.precio;
                }
            } catch (err) { console.log("Producto no encontrado"); }
        }

        const cant = parseFloat(updated[index].cant) || 0;
        const unit = parseFloat(updated[index].unit) || 0;
        updated[index].total = cant * unit;
        setProductos(updated);
    };

    const calcularTotales = () => {
        const subtotal = productos.reduce((acc, p) => acc + (p.total || 0), 0);
        const iva = subtotal * 0.19;
        const totalFinal = subtotal + iva;
        return { subtotal, iva, totalFinal };
    };

    const { subtotal, iva, totalFinal } = calcularTotales();

    // =======================================================
    // ENVÍO AL BACKEND
    // =======================================================
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!cliente.id) {
            alert("Por favor, seleccione un cliente válido.");
            return;
        }

        setLoading(true);
        const token = sessionStorage.getItem('authToken');
        const facturaData = {
            cliente_id: cliente.id,
            tipo_pago: tipoFactura,
            fecha_emision: document.getElementById('fecha-emision').value,
            subtotal,
            iva,
            total: totalFinal,
            detalles: productos 
        };

        try {
            const response = await fetch(`${apiBaseUrl}/facturas`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(facturaData)
            });

            if (response.ok) {
                const result = await response.json();
                alert(`✅ Factura ${result.numero_factura} creada con éxito`);
                window.close();
            } else {
                throw new Error("Error al guardar la factura");
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
                {isEditing ? `Editar Factura #${id}` : 'Registrar Nueva Factura'}
            </h2> 
            
            <div className="section-group header-fields">
                <div className="field-col"> 
                    <label>Tipo Factura:</label>
                    <div className="radio-group">
                        <label className="radio-label">
                            <input type="radio" name="tipoFactura" checked={tipoFactura === 'Contado'} onChange={() => setTipoFactura('Contado')} /> Contado
                        </label>
                        <label className="radio-label">
                            <input type="radio" name="tipoFactura" checked={tipoFactura === 'Crédito'} onChange={() => setTipoFactura('Crédito')} /> Crédito
                        </label>
                    </div>
                </div>
                
                <div className="field-col">
                    <label>Número de Factura</label>
                    {/* CAMBIO: Ahora usa el estado numeroFactura */}
                    <input type="text" className="input-short" value={numeroFactura} disabled />
                </div>

                <div className="field-col">
                    <label htmlFor="fecha-emision">Fecha</label>
                    <input type="date" id="fecha-emision" className="input-short" defaultValue={new Date().toISOString().substring(0, 10)} />
                </div>
            </div>
            
            <h2 className="section-title">2. Datos del Cliente</h2> 
            <div className="section-group client-data"> 
                <div className="field-col">
                    <label>NIT/CC (Enter para buscar)</label>
                    <input 
                        type="text" 
                        placeholder="Identificación" 
                        onBlur={(e) => buscarCliente(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && buscarCliente(e.target.value)}
                    />
                </div>
                <div className="field-col">
                    <label>Razón Social / Nombre</label>
                    <input type="text" value={cliente.nombre_razon_social} readOnly placeholder="Nombre completo" />
                </div>
                <div className="field-col">
                    <label>Teléfono</label>
                    <input type="text" value={cliente.telefono} readOnly />
                </div>
                <div className="field-col">
                    <label>Dirección</label>
                    <input type="text" value={cliente.direccion} readOnly />
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
                    {loading ? 'Procesando...' : 'Crear Factura'}
                </button>
                <button type="button" className="btn btn-danger" onClick={() => window.close()}>Cancelar</button>
            </div>
        </form>
    );
};

export default InvoiceForm;