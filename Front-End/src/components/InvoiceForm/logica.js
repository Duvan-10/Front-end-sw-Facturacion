import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useInvoiceLogic = () => {
    const navigate = useNavigate();

    // --- ESTADOS ---
    const [pagoEstado, setPagoEstado] = useState('Default');
    const [numeroFactura, setNumeroFactura] = useState('Cargando...');
    const [fechaEmision, setFechaEmision] = useState(new Date().toISOString().split('T')[0]);
    const [identificacion, setIdentificacion] = useState('');
    const [sugerencias, setSugerencias] = useState([]);
    const [cliente, setCliente] = useState({ id: '', nombre: '', correo: '', telefono: '', direccion: '' });
    
    // ESTADO PRODUCTOS
    const [productosFactura, setProductosFactura] = useState([
        { producto_id: null, codigo: '', cantidad: 1, detalle: '', vUnitario: 0, vTotal: 0, ivaPorcentaje: 0 }
    ]);
    const [sugerenciasProd, setSugerenciasProd] = useState([]);

    // --- 1. OBTENER PRÓXIMO NÚMERO ---
    const obtenerProximoNumero = async () => {
        try {
            const token = sessionStorage.getItem('authToken');
            const res = await fetch('http://localhost:8080/api/facturas/proximo-numero', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setNumeroFactura(data.numero);
            }
        } catch (err) { setNumeroFactura("FAC-0000"); }
    };

    useEffect(() => { obtenerProximoNumero(); }, []);

    // --- 2. AUTOCOMPLETADO DE CLIENTES ---
    useEffect(() => {
        const buscarCoincidencias = async () => {
            if (identificacion.length > 2) {
                try {
                    const token = sessionStorage.getItem('authToken');
                    const res = await fetch(`http://localhost:8080/api/clientes?search=${identificacion}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) setSugerencias(await res.json());
                } catch (err) { console.error(err); }
            } else { setSugerencias([]); }
        };
        const timeoutId = setTimeout(buscarCoincidencias, 300);
        return () => clearTimeout(timeoutId);
    }, [identificacion]);

    // --- 3. SELECCIÓN DE CLIENTE (CORREGIDO: No fija nombre en identificación) ---
    const seleccionarCliente = (e) => {
        const valorIngresado = e.target.value;
        setIdentificacion(valorIngresado);

        const encontrado = sugerencias.find(c => 
            String(c.identificacion) === String(valorIngresado) || 
            c.nombre_razon_social === valorIngresado
        );

        if (encontrado) {
            setIdentificacion(encontrado.identificacion); 
            setCliente({
                id: encontrado.id,
                nombre: encontrado.nombre_razon_social,
                correo: encontrado.email,
                telefono: encontrado.telefono,
                direccion: encontrado.direccion
            });
        } else {
            setCliente({ id: '', nombre: '', correo: '', telefono: '', direccion: '' });
        }
    };

    // --- 4. VALIDACIÓN POR CAMPO (CASCADA: VACÍO + FORMATO) ---
    const validarDatosCliente = () => {
        const regexSoloNumeros = /^[0-9]+$/;
        const regexSoloLetras = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/;
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // 1. VALIDAR IDENTIFICACIÓN (NIT/CC)
        if (!identificacion || !identificacion.trim()) { 
            alert("⚠️ El campo 'Identificación' es obligatorio."); 
            return false; 
        }
        if (!regexSoloNumeros.test(identificacion)) { 
            alert("⚠️ La identificación debe contener únicamente números."); 
            return false; 
        }

        // 2. VALIDAR NOMBRE O RAZÓN SOCIAL
        if (!cliente.nombre || !cliente.nombre.trim()) { 
            alert("⚠️ El campo 'Nombre o Razón Social' es obligatorio."); 
            return false; 
        }
        if (!regexSoloLetras.test(cliente.nombre)) { 
            alert("⚠️ El nombre solo debe contener letras y espacios."); 
            return false; 
        }

        // 3. VALIDAR TELÉFONO
        if (!cliente.telefono || !cliente.telefono.trim()) { 
            alert("⚠️ El campo 'Teléfono' es obligatorio."); 
            return false; 
        }
        if (!regexSoloNumeros.test(cliente.telefono) || cliente.telefono.length < 7) { 
            alert("⚠️ El teléfono debe ser numérico y tener al menos 7 dígitos."); 
            return false; 
        }

        // 4. VALIDAR CORREO (Solo si el usuario escribió algo)
        if (cliente.correo && cliente.correo.trim() !== "") {
            if (!regexEmail.test(cliente.correo)) {
                alert("⚠️ El formato del correo electrónico es incorrecto.");
                return false;
            }
        }

        return true; // Si llega aquí, todo está perfecto
    };


    // --- 5. LÓGICA DE PRODUCTOS (INTACTA) ---
    const buscarProductos = async (t) => {
        if (!t) return;
        try {
            const token = sessionStorage.getItem('authToken');
            const res = await fetch(`http://localhost:8080/api/facturas/buscar-productos?q=${t}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setSugerenciasProd(await res.json());
        } catch (error) { console.error(error); }
    };

    const handleInputChange = (index, campo, valor) => {
        const nuevos = [...productosFactura];
        nuevos[index][campo] = valor;
        if (campo === 'codigo') {
            const p = sugerenciasProd.find(prod => String(prod.codigo) === String(valor));
            if (p) {
                const desc = p.descripcion ? ` - ${p.descripcion}` : "";
                nuevos[index].producto_id = p.id;
                nuevos[index].detalle = `${p.nombre}${desc}`;
                nuevos[index].vUnitario = p.precio;
                nuevos[index].ivaPorcentaje = p.impuesto_porcentaje || 0;
            } else {
                nuevos[index].producto_id = null;
                nuevos[index].vUnitario = 0;
            }
        }
        nuevos[index].vTotal = (parseFloat(nuevos[index].cantidad) || 0) * (parseFloat(nuevos[index].vUnitario) || 0);
        setProductosFactura(nuevos);
    };

// --- 6. REGISTRO Y GUARDADO ---
    const registrarClienteRapido = async (token) => {
        try {
            const res = await fetch('http://localhost:8080/api/clientes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    tipo_identificacion: 'Cédula',
                    identificacion: identificacion.trim(),
                    nombre_razon_social: cliente.nombre.trim(),
                    email: cliente.correo?.trim() || null,
                    telefono: cliente.telefono.trim(),
                    direccion: cliente.direccion?.trim() || 'Sin dirección'
                })
            });
            
            const data = await res.json();
            
            if (res.ok) {
                // Si el backend responde bien, actualizamos el ID y retornamos
                setCliente(prev => ({ ...prev, id: data.cliente.id }));
                return data.cliente.id;
            } else {
                alert("❌ Error al registrar cliente: " + (data.message || "Error desconocido"));
                return null;
            }
        } catch (err) { 
            console.error("Error en registrarClienteRapido:", err);
            alert("❌ No se pudo conectar con el servidor para registrar al cliente.");
            return null; 
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        
        // 1. Validar Pago
        if (pagoEstado === 'Default') return alert("⚠️ Seleccione el estado de pago.");

        // 2. Validar campos obligatorios (Cascada)
        if (!validarDatosCliente()) return; 

        const token = sessionStorage.getItem('authToken');
        let clienteIdActual = cliente.id;

        // 3. Registro de cliente nuevo
        if (!clienteIdActual) {
            if (window.confirm("¿El cliente no existe, deseas registrarlo con estos datos?")) {
                clienteIdActual = await registrarClienteRapido(token);
                // Si clienteIdActual es null, significa que falló el registro, detenemos todo.
                if (!clienteIdActual) return; 
            } else {
                return; // El usuario canceló
            }
        }

        // 4. Preparar datos de la factura (Hora exacta y Totales)
        const ahora = new Date();
        const horas = String(ahora.getHours()).padStart(2, '0');
        const minutos = String(ahora.getMinutes()).padStart(2, '0');
        const segundos = String(ahora.getSeconds()).padStart(2, '0');
        const fechaFormateada = `${fechaEmision} ${horas}:${minutos}:${segundos}`;

        // Recalculamos aquí mismo para asegurar que los valores existan
        const subtotalCalc = productosFactura.reduce((acc, p) => acc + (parseFloat(p.vTotal) || 0), 0);
        const ivaCalc = productosFactura.reduce((acc, p) => acc + ((parseFloat(p.vTotal) || 0) * ((parseFloat(p.ivaPorcentaje) || 0) / 100)), 0);

        // 5. Enviar Factura
        try {
            const response = await fetch('http://localhost:8080/api/facturas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    cliente_id: clienteIdActual,
                    pago: pagoEstado,
                    fecha_emision: fechaFormateada,
                    subtotal: subtotalCalc,
                    iva: ivaCalc,
                    total: subtotalCalc + ivaCalc,
                    productos: productosFactura.filter(p => p.producto_id !== null)
                })
            });

            if (response.ok) {
                alert("✅ Factura guardada correctamente");
                window.location.reload();
            } else {
                const errorData = await response.json();
                alert("❌ Error al guardar factura: " + (errorData.message || "Consulte al administrador"));
            }
        } catch (err) { 
            console.error("Error en handleSubmit:", err);
            alert("❌ Error de conexión al intentar guardar la factura."); 
        }
    };
    
    return {
        pagoEstado, setPagoEstado, numeroFactura, fechaEmision, setFechaEmision,
        identificacion, setIdentificacion, seleccionarCliente,
        handleClienteChange: (e) => setCliente(prev => ({ ...prev, [e.target.name]: e.target.value })),
        cliente, sugerencias, productosFactura, sugerenciasProd, buscarProductos,
        agregarFilaProducto: () => setProductosFactura([...productosFactura, { producto_id: null, codigo: '', cantidad: 1, detalle: '', vUnitario: 0, vTotal: 0, ivaPorcentaje: 0 }]),
        eliminarFilaProducto: (i) => { if (productosFactura.length > 1) setProductosFactura(productosFactura.filter((_, idx) => idx !== i)) },
        handleInputChange, handleSubmit,
        subtotal: productosFactura.reduce((acc, p) => acc + (parseFloat(p.vTotal) || 0), 0),
        iva: productosFactura.reduce((acc, p) => acc + ((parseFloat(p.vTotal) || 0) * ((parseFloat(p.ivaPorcentaje) || 0) / 100)), 0),
        totalGeneral: productosFactura.reduce((acc, p) => acc + (parseFloat(p.vTotal) || 0), 0) + productosFactura.reduce((acc, p) => acc + ((parseFloat(p.vTotal) || 0) * ((parseFloat(p.ivaPorcentaje) || 0) / 100)), 0)
    };
};