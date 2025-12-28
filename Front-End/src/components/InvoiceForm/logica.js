import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useInvoiceLogic = () => {
    const navigate = useNavigate();

    // ==========================================
    // 1. ESTADO DE PAGO
    // ==========================================
    const [pagoEstado, setPagoEstado] = useState('Default');


    // ==========================================
    // 2. NUMERO FACTURA Y FECHA
    // ==========================================
    const [numeroFactura, setNumeroFactura] = useState('Cargando...');
    const [fechaEmision, setFechaEmision] = useState(() => {
        const ahora = new Date();
        return ahora.getFullYear() + "-" + 
               String(ahora.getMonth() + 1).padStart(2, '0') + "-" + 
               String(ahora.getDate()).padStart(2, '0');
    });

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


    // ==========================================
    // 3. DETALLES CLIENTE (Búsqueda, Selección, Registro)
    // ==========================================
    const [identificacion, setIdentificacion] = useState('');
    const [sugerencias, setSugerencias] = useState([]);
    const [cliente, setCliente] = useState({ id: '', nombre: '', correo: '', telefono: '', direccion: '' });

    // Autocompletado
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

    // Selección de cliente sugerido
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

    // Validación de datos
    const validarDatosCliente = () => {
        const regexSoloNumeros = /^[0-9]+$/;
        const regexSoloLetras = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s.]+$/; 
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!identificacion?.trim() || !regexSoloNumeros.test(identificacion)) { 
            alert("⚠️ Identificación obligatoria y numérica."); return false; 
        }
        if (!cliente.nombre?.trim() || !regexSoloLetras.test(cliente.nombre)) { 
            alert("⚠️ Nombre obligatorio (solo letras)."); return false; 
        }
        if (!cliente.telefono?.trim() || !regexSoloNumeros.test(cliente.telefono) || cliente.telefono.length < 7) { 
            alert("⚠️ Teléfono obligatorio (mín. 7 dígitos)."); return false; 
        }
        if (cliente.correo?.trim() && !regexEmail.test(cliente.correo)) {
            alert("⚠️ Formato de correo incorrecto."); return false;
        }
        return true;
    };

    // Registro rápido de cliente nuevo
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
                setCliente(prev => ({ ...prev, id: data.cliente.id }));
                return data.cliente.id;
            }
            alert("❌ Error al registrar cliente: " + data.message);
            return null;
        } catch (err) { 
            alert("❌ Error de conexión al registrar cliente.");
            return null; 
        }
    };


    // ==========================================
    // 4. DETALLES PRODUCTO
    // ==========================================
    const [productosFactura, setProductosFactura] = useState([
        { producto_id: null, codigo: '', cantidad: 1, detalle: '', vUnitario: 0, vTotal: 0, ivaPorcentaje: 0 }
    ]);
    const [sugerenciasProd, setSugerenciasProd] = useState([]);

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


    // ==========================================
    // 5. VALORES (Cálculos de Totales)
    // ==========================================
    const subtotal = productosFactura.reduce((acc, p) => acc + (parseFloat(p.vTotal) || 0), 0);
    const iva = productosFactura.reduce((acc, p) => acc + ((parseFloat(p.vTotal) || 0) * ((parseFloat(p.ivaPorcentaje) || 0) / 100)), 0);
    const totalGeneral = subtotal + iva;


    // ==========================================
    // 6. BOTONES CREAR FACTURA Y CANCELAR
    // ==========================================
    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        
        if (pagoEstado === 'Default') return alert("⚠️ Seleccione el estado de pago.");
        if (!validarDatosCliente()) return; 

        const token = sessionStorage.getItem('authToken');
        let clienteIdActual = cliente.id;

        if (!clienteIdActual) {
            if (window.confirm("¿El cliente no existe, deseas registrarlo con estos datos?")) {
                clienteIdActual = await registrarClienteRapido(token);
                if (!clienteIdActual) return; 
            } else return;
        }

        // Preparar fecha con hora exacta de la PC
        const ahora = new Date();
        const horaExacta = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}:${String(ahora.getSeconds()).padStart(2, '0')}`;
        const fechaFinalFactura = `${fechaEmision} ${horaExacta}`;

        try {
            const response = await fetch('http://localhost:8080/api/facturas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    cliente_id: clienteIdActual,
                    pago: pagoEstado,
                    fecha_emision: fechaFinalFactura,
                    subtotal: subtotal,
                    iva: iva,
                    total: totalGeneral,
                    productos: productosFactura.filter(p => p.producto_id !== null)
                })
            });

            if (response.ok) {
                alert("✅ Factura guardada correctamente");
                window.location.reload();
            } else {
                const errorData = await response.json();
                alert("❌ Error: " + (errorData.message || "No se pudo guardar"));
            }
        } catch (err) { alert("❌ Error de conexión"); }
    };
    
    // Retorno unificado para el componente
    return {
        // Estado Pago
        pagoEstado, setPagoEstado,
        // Numero/Fecha
        numeroFactura, fechaEmision, setFechaEmision,
        // Cliente
        identificacion, setIdentificacion, seleccionarCliente, cliente, sugerencias,
        handleClienteChange: (e) => setCliente(prev => ({ ...prev, [e.target.name]: e.target.value })),
        // Productos
        productosFactura, sugerenciasProd, buscarProductos, handleInputChange,
        agregarFilaProducto: () => setProductosFactura([...productosFactura, { producto_id: null, codigo: '', cantidad: 1, detalle: '', vUnitario: 0, vTotal: 0, ivaPorcentaje: 0 }]),
        eliminarFilaProducto: (i) => { if (productosFactura.length > 1) setProductosFactura(productosFactura.filter((_, idx) => idx !== i)) },
        // Valores
        subtotal, iva, totalGeneral,
        // Acciones Finales
        handleSubmit
    };
};