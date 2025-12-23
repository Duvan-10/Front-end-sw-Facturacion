import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Asegúrate de importar navigate

export const useInvoiceLogic = () => {
    const navigate = useNavigate();

    // --- ESTADOS PAGO ---
    const [pagoEstado, setPagoEstado] = useState('Default');

    // --- ESTADOS NÚMERO DE FACTURA Y FECHA ---
    const [numeroFactura, setNumeroFactura] = useState('Cargando...');
    const [fechaEmision, setFechaEmision] = useState(new Date().toISOString().split('T')[0]);

    // --- ESTADOS CLIENTE ---
    const [identificacion, setIdentificacion] = useState('');
    const [sugerencias, setSugerencias] = useState([]);
    const [cliente, setCliente] = useState({ id: '', nombre: '', correo: '', telefono: '', direccion: '' });

    // --- ESTADOS PRODUCTOS ---
    const [productosFactura, setProductosFactura] = useState([
        { codigo: '', cantidad: 1, detalle: '', vUnitario: 0, vTotal: 0, ivaPorcentaje: 0 }
    ]);
    const [sugerenciasProd, setSugerenciasProd] = useState([]);

    // --- EFECTO: OBTENER NÚMERO DE FACTURA ---
    useEffect(() => {
        const obtenerDatos = async () => {
            try {
                const token = sessionStorage.getItem('authToken');
                const res = await fetch('http://localhost:8080/api/facturas/proximo-numero', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setNumeroFactura(data.numero);
                }
            } catch (err) {
                console.error("Error:", err);
                setNumeroFactura("FAC-0000");
            }
        };
        obtenerDatos();
    }, []);

    // --- EFECTO: BUSCAR CLIENTES ---
    useEffect(() => {
        const buscarCoincidencias = async () => {
            if (identificacion.length > 2) {
                try {
                    const token = sessionStorage.getItem('authToken');
                    const res = await fetch(`http://localhost:8080/api/clientes?search=${identificacion}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setSugerencias(data);
                    }
                } catch (err) {
                    console.error("Error en autocompletado:", err);
                }
            } else {
                setSugerencias([]);
            }
        };
        const timeoutId = setTimeout(buscarCoincidencias, 300);
        return () => clearTimeout(timeoutId);
    }, [identificacion]);

    const seleccionarCliente = (e) => {
        const valorIngresado = e.target.value;
        setIdentificacion(valorIngresado);
        const encontrado = sugerencias.find(c => String(c.identificacion) === String(valorIngresado));
        
        if (encontrado) {
            setCliente({
                id: encontrado.id,
                nombre: encontrado.nombre_razon_social,
                correo: encontrado.email,
                telefono: encontrado.telefono || '',
                direccion: encontrado.direccion || ''
            });
        } else {
            setCliente({ id: '', nombre: '', correo: '', telefono: '', direccion: '' });
        }
    };

    // --- LÓGICA PRODUCTOS ---
    const handleInputChange = (index, campo, valor) => {
        const nuevosProductos = [...productosFactura];
        nuevosProductos[index][campo] = valor;

        if (campo === 'codigo') {
            const encontrado = sugerenciasProd.find(p => String(p.codigo) === String(valor));
            if (encontrado) {
                nuevosProductos[index].producto_id = encontrado.id;
                nuevosProductos[index].detalle = `${encontrado.nombre} - ${encontrado.descripcion || ''}`;
                nuevosProductos[index].vUnitario = encontrado.precio;
                nuevosProductos[index].ivaPorcentaje = encontrado.impuesto_porcentaje || 0;
            }
        }

        const cant = parseFloat(nuevosProductos[index].cantidad) || 0;
        const precio = parseFloat(nuevosProductos[index].vUnitario) || 0;
        nuevosProductos[index].vTotal = cant * precio;
        setProductosFactura(nuevosProductos);
    };

    const buscarProductos = async (termino) => {
        if (!termino || termino.length < 1) return;
        try {
            const token = sessionStorage.getItem('authToken');
            const res = await fetch(`http://localhost:8080/api/facturas/buscar-productos?q=${termino}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const datos = await res.json();
                setSugerenciasProd(datos);
            }
        } catch (error) {
            console.error("Error buscando productos", error);
        }
    };

    const agregarFilaProducto = () => {
        setProductosFactura([...productosFactura, { codigo: '', cantidad: 1, detalle: '', vUnitario: 0, vTotal: 0, ivaPorcentaje: 0 }]);
    };

    const eliminarFilaProducto = (index) => {
        if (productosFactura.length > 1) {
            setProductosFactura(productosFactura.filter((_, i) => i !== index));
        }
    };

    // --- CÁLCULOS DE TOTALES ---
    const subtotal = productosFactura.reduce((acc, prod) => acc + (parseFloat(prod.vTotal) || 0), 0);
    const valorIva = productosFactura.reduce((acc, prod) => {
        const impuesto = (parseFloat(prod.vTotal) || 0) * ((parseFloat(prod.ivaPorcentaje) || 0) / 100);
        return acc + impuesto;
    }, 0);
    const totalFinal = subtotal + valorIva;

    // --- FUNCIÓN GUARDAR ---
// --- FUNCIÓN GUARDAR (CORREGIDA Y SINCRONIZADA) ---
const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (pagoEstado === 'Default') {
        alert("⚠️ Por favor, seleccione si la factura está pagada (Si / No).");
        return;
    }

    // Estructuramos el objeto EXACTAMENTE como lo espera el Backend corregido
    const facturaData = {
    cliente_id: cliente?.id,
    pago: pagoEstado,
    fecha: fechaEmision,   
    subtotal: subtotal,    
    iva: valorIva,         
    total: totalFinal,  
    productos: productosFactura
    };

    try {
        const token = sessionStorage.getItem('authToken');
        const response = await fetch('http://localhost:8080/api/facturas', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(facturaData),
        });

        const result = await response.json();

        if (response.ok) {
            alert("✅ Factura guardada con éxito");
            navigate('/home/facturas');
        } else {
            // Si el backend falla, ahora nos dirá exactamente por qué
            console.error("Error del servidor:", result.error);
            alert("❌ Error al guardar: " + result.error);
        }
    } catch (error) {
        console.error("Error de conexión:", error);
        alert("❌ No se pudo conectar con el servidor");
    }
};

    return {
        pagoEstado,
        setPagoEstado,
        numeroFactura,
        fechaEmision,
        setFechaEmision,
        identificacion,
        seleccionarCliente,
        cliente,
        sugerencias,
        productosFactura,
        sugerenciasProd,
        buscarProductos,
        agregarFilaProducto,
        eliminarFilaProducto,
        handleInputChange,
        handleSubmit,
        subtotal,
        iva: valorIva,
        totalGeneral: totalFinal
    };
};