import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    REGEX,
    esIdentificacionValida,
    esNombreValido,
    esTelefonoValido,
    esEmailValido,
    esCodigoValido,
    esDetalleValido,
    formatearProductoParaBD,
    formatearClienteParaBD,
    getMensajeDuplicado,
    esDetalleProductoValido,
    getMensajeDetalleProductoIncorrecto
} from '../utils/validations.js';

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
            const token = sessionStorage.getItem('token');
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
    const [cliente, setCliente] = useState({ 
        id: '', 
        tipo_identificacion: 'C.C.',
        nombre: '', 
        correo: '', 
        telefono: '', 
        direccion: '' 
    });
    const [clienteModificado, setClienteModificado] = useState(false);

    // Autocompletado para clientes
    useEffect(() => {
        const buscarCoincidencias = async () => {
            if (identificacion.length > 2) {
                try {
                    const token = sessionStorage.getItem('token');
                    const res = await fetch(`http://localhost:8080/api/clientes/buscar?term=${identificacion}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) setSugerencias(await res.json());
                } catch (err) { console.error(err); }
            } else { setSugerencias([]); }
        };
        const timeoutId = setTimeout(buscarCoincidencias, 300);
        return () => clearTimeout(timeoutId);
    }, [identificacion]);

    // Validar que identificación no sea duplicada
    const validarIdentificacionDuplicada = async (idNumber) => {
        try {
            const token = sessionStorage.getItem('token');
            const res = await fetch(`http://localhost:8080/api/clientes/identificacion/${idNumber}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return res.ok; // true si existe, false si no
        } catch (err) {
            return false;
        }
    };

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
                tipo_identificacion: encontrado.tipo_identificacion || 'C.C.',
                nombre: encontrado.nombre_razon_social,
                correo: encontrado.email,
                telefono: encontrado.telefono,
                direccion: encontrado.direccion
            });
            setClienteModificado(false);
        } else {
            setCliente({ 
                id: '', 
                tipo_identificacion: 'C.C.',
                nombre: '', 
                correo: '', 
                telefono: '', 
                direccion: '' 
            });
            setClienteModificado(true);
        }
    };

    // Autocompletar cliente con tecla Tab
    const autocompletarClienteConTab = (e) => {
        if (e.key === 'Tab' && sugerencias.length > 0) {
            e.preventDefault();
            // Seleccionar el primer cliente de las sugerencias
            const clienteSugerido = sugerencias[0];
            setIdentificacion(clienteSugerido.identificacion);
            setCliente({
                id: clienteSugerido.id,
                tipo_identificacion: clienteSugerido.tipo_identificacion || 'C.C.',
                nombre: clienteSugerido.nombre_razon_social,
                correo: clienteSugerido.email,
                telefono: clienteSugerido.telefono,
                direccion: clienteSugerido.direccion
            });
            setClienteModificado(false);
            setSugerencias([]); // Limpiar sugerencias
        }
    };

    // Caracteres válidos para campos del cliente
    const regexSoloNumeros = /^[0-9]+$/;
    const regexSoloLetras = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s.'-]*$/;
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const regexTelefono = /^[0-9\-\+\(\)]*$/;

    // Validación de datos del cliente
    const validarDatosCliente = async () => {
        // Validar identificación
        if (!identificacion?.trim()) {
            alert("⚠️ Identificación obligatoria.");
            return false;
        }
        if (!esIdentificacionValida(identificacion)) {
            alert("⚠️ Identificación: solo números permitidos.");
            return false;
        }

        // Validar si identificación existe y es nuevo cliente
        if (!cliente.id && clienteModificado) {
            const existe = await validarIdentificacionDuplicada(identificacion.trim());
            if (existe) {
                alert(getMensajeDuplicado("Identificación", identificacion));
                return false;
            }
        }

        // Validar nombre
        if (!cliente.nombre?.trim()) {
            alert("⚠️ Nombre/Razón Social obligatorio.");
            return false;
        }
        if (!esNombreValido(cliente.nombre)) {
            alert("⚠️ Nombre: solo letras, espacios, puntos y apóstrofes permitidos.");
            return false;
        }

        // Validar teléfono
        if (!cliente.telefono?.trim()) {
            alert("⚠️ Teléfono obligatorio.");
            return false;
        }
        if (!esTelefonoValido(cliente.telefono)) {
            alert("⚠️ Teléfono: mínimo 7 dígitos, sin caracteres especiales (excepto +, -, ()).");
            return false;
        }

        // Validar correo (opcional)
        if (!esEmailValido(cliente.correo)) {
            alert("⚠️ Correo: formato incorrecto (ejemplo: usuario@dominio.com).");
            return false;
        }

        return true;
    };

    // Guardar o actualizar cliente
    const guardarOActualizarCliente = async (token) => {
        try {
            const datos = formatearClienteParaBD(cliente, identificacion);

            if (cliente.id) {
                // Actualizar cliente existente
                const res = await fetch(`http://localhost:8080/api/clientes/${cliente.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(datos)
                });
                const data = await res.json();
                if (res.ok) {
                    return cliente.id;
                } else {
                    alert("❌ Error al actualizar cliente: " + data.message);
                    return null;
                }
            } else {
                // Crear cliente nuevo
                const res = await fetch('http://localhost:8080/api/clientes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(datos)
                });
                const data = await res.json();
                if (res.ok) {
                    setCliente(prev => ({ ...prev, id: data.cliente.id }));
                    return data.cliente.id;
                } else {
                    alert("❌ Error al registrar cliente: " + data.message);
                    return null;
                }
            }
        } catch (err) {
            alert("❌ Error de conexión al guardar cliente.");
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
    const [productosNuevos, setProductosNuevos] = useState(new Set()); // Rastrear productos nuevos

    // Búsqueda de productos existentes
    const buscarProductos = async (t) => {
        if (!t) {
            setSugerenciasProd([]);
            return;
        }
        try {
            const token = sessionStorage.getItem('token');
            const res = await fetch(`http://localhost:8080/api/facturas/buscar-productos?q=${t}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setSugerenciasProd(await res.json());
        } catch (error) { console.error(error); }
    };

    // Validar caracteres en campos de producto
    const esCodigoValidoLocal = (codigo) => esCodigoValido(codigo);
    const esDetalleValidoLocal = (detalle) => esDetalleValido(detalle);
    const esValorValido = (valor) => !isNaN(parseFloat(valor)) && parseFloat(valor) > 0;

    // Validar código duplicado
    const validarCodigoDuplicado = async (codigo, excluyendoIndex = null) => {
        if (!codigo.trim()) return false;
        
        // Validar en la lista de productos de la factura
        for (let i = 0; i < productosFactura.length; i++) {
            if (i !== excluyendoIndex && productosFactura[i].codigo === codigo.trim() && productosFactura[i].codigo) {
                return true; // Está duplicado en el formulario
            }
        }

        // Validar en la base de datos
        try {
            const token = sessionStorage.getItem('token');
            const res = await fetch(`http://localhost:8080/api/productos/codigo/${codigo.trim()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return res.ok; // true si existe en BD
        } catch (err) {
            return false;
        }
    };

    // Manejo de cambios en los inputs de productos
    const handleInputChange = (index, campo, valor) => {
        const nuevos = [...productosFactura];
        const productoActual = nuevos[index];

        if (campo === 'codigo') {
            productoActual.codigo = valor;

            // Buscar producto en sugerencias
            const productoEncontrado = sugerenciasProd.find(p => String(p.codigo) === String(valor));
            
            if (productoEncontrado) {
                // Autocompletar todos los campos
                productoActual.producto_id = productoEncontrado.id;
                productoActual.detalle = productoEncontrado.nombre + 
                    (productoEncontrado.descripcion ? ` - ${productoEncontrado.descripcion}` : "");
                productoActual.vUnitario = parseFloat(productoEncontrado.precio) || 0;
                productoActual.ivaPorcentaje = parseFloat(productoEncontrado.impuesto_porcentaje) || 0;
                
                // Marcar como producto existente
                const nuevosProductos = new Set(productosNuevos);
                nuevosProductos.delete(index);
                setProductosNuevos(nuevosProductos);
            } else {
                // Producto no existe en BD: limpiar campos de detalle
                productoActual.producto_id = null;
                productoActual.detalle = '';
                productoActual.vUnitario = 0;
                productoActual.ivaPorcentaje = 0;
                // Recalcular total
                productoActual.vTotal = (parseFloat(productoActual.cantidad) || 0) * (parseFloat(productoActual.vUnitario) || 0);

                // No marcar como nuevo automáticamente
                const nuevosProductos = new Set(productosNuevos);
                nuevosProductos.delete(index);
                setProductosNuevos(nuevosProductos);
            }
        } else if (campo === 'cantidad') {
            productoActual.cantidad = valor;
        } else if (campo === 'detalle') {
            productoActual.detalle = valor;
            // Validar que el detalle siga el patrón "nombre - descripción"
            if (valor.trim() && !esDetalleProductoValido(valor)) {
                // Mostrar advertencia visual (se validará completamente en handleSubmit)
                console.warn(`Detalle incorrecto en producto: debe ser 'Nombre - Descripción'`);
            }
        } else if (campo === 'vUnitario') {
            productoActual.vUnitario = valor;
        }

        // Calcular vTotal
        productoActual.vTotal = (parseFloat(productoActual.cantidad) || 0) * (parseFloat(productoActual.vUnitario) || 0);
        
        setProductosFactura(nuevos);
    };

    // Autocompletar producto con tecla Tab
    const autocompletarProductoConTab = (e, index) => {
        if (e.key === 'Tab' && sugerenciasProd.length > 0) {
            e.preventDefault();
            // Seleccionar el primer producto de las sugerencias
            const productoSugerido = sugerenciasProd[0];
            const nuevos = [...productosFactura];
            nuevos[index].codigo = productoSugerido.codigo;
            nuevos[index].producto_id = productoSugerido.id;
            nuevos[index].detalle = productoSugerido.nombre + 
                (productoSugerido.descripcion ? ` - ${productoSugerido.descripcion}` : "");
            nuevos[index].vUnitario = parseFloat(productoSugerido.precio) || 0;
            nuevos[index].ivaPorcentaje = parseFloat(productoSugerido.impuesto_porcentaje) || 0;
            nuevos[index].vTotal = (parseFloat(nuevos[index].cantidad) || 0) * (parseFloat(nuevos[index].vUnitario) || 0);
            
            setProductosFactura(nuevos);
            setSugerenciasProd([]); // Limpiar sugerencias
            
            // Marcar como producto existente
            const nuevosProductos = new Set(productosNuevos);
            nuevosProductos.delete(index);
            setProductosNuevos(nuevosProductos);
        }
    };

    // Guardar o actualizar producto en la BD
    const guardarOActualizarProducto = async (token, index) => {
        const producto = productosFactura[index];
        
        if (!producto.codigo?.trim() || !producto.detalle?.trim() || !producto.vUnitario) {
            return producto.producto_id || null; // Si tiene ID, retornar
        }

        try {
            // Validar y formatear el producto (esto lanzará un error si el formato es inválido)
            const datosProducto = formatearProductoParaBD(producto);

            if (producto.producto_id) {
                // Actualizar producto existente
                const res = await fetch(`http://localhost:8080/api/productos/${producto.producto_id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(datosProducto)
                });
                const data = await res.json();
                if (res.ok) {
                    return producto.producto_id;
                } else {
                    console.error("Error al actualizar producto:", data.message);
                    return null;
                }
            } else {
                // Crear producto nuevo
                const res = await fetch('http://localhost:8080/api/productos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(datosProducto)
                });
                const data = await res.json();
                if (res.ok) {
                    return data.id;
                } else {
                    console.error("Error al crear producto:", data.message);
                    return null;
                }
            }
        } catch (err) {
            console.error("Error al guardar/actualizar producto:", err.message);
            alert(`❌ Error en Producto ${index + 1}: ${err.message}`);
            return null;
        }
    };


    // ==========================================
    // 5. VALORES (Cálculos de Totales)
    // ==========================================
    const subtotal = productosFactura.reduce((acc, p) => acc + (parseFloat(p.vTotal) || 0), 0);
    const iva = productosFactura.reduce((acc, p) => acc + ((parseFloat(p.vTotal) || 0) * ((parseFloat(p.ivaPorcentaje) || 0) / 100)), 0);
    const totalGeneral = subtotal + iva;


    // ==========================================
    // 6. VALIDACIONES DE FORMULARIO
    // ==========================================
    const validarProductos = async () => {
        // Validar que hay al menos un producto
        const productosConCodigo = productosFactura.filter(p => p.codigo?.trim());
        if (productosConCodigo.length === 0) {
            alert("⚠️ Debe agregar al menos un producto.");
            return false;
        }

        // Validar cada producto
        for (let i = 0; i < productosFactura.length; i++) {
            const p = productosFactura[i];
            
            if (!p.codigo?.trim()) continue; // Si no tiene código, pasar

            // Validar que código es obligatorio
            if (!p.codigo?.trim()) {
                alert(`⚠️ Producto ${i + 1}: Código es obligatorio.`);
                return false;
            }

            // Validar caracteres en código
            if (!esCodigoValidoLocal(p.codigo)) {
                alert(`⚠️ Producto ${i + 1}: Código contiene caracteres inválidos. Solo se permiten letras, números, guiones y guiones bajos.`);
                return false;
            }

            // Validar detalle obligatorio
            if (!p.detalle?.trim()) {
                alert(`⚠️ Producto ${i + 1}: Detalle es obligatorio.`);
                return false;
            }

            // Validar que el detalle siga el patrón "nombre - descripción"
            if (!esDetalleProductoValido(p.detalle)) {
                alert(getMensajeDetalleProductoIncorrecto(i + 1));
                return false;
            }

            // Validar caracteres en detalle
            if (!esDetalleValidoLocal(p.detalle)) {
                alert(`⚠️ Producto ${i + 1}: Detalle contiene caracteres inválidos. No se permiten caracteres especiales.`);
                return false;
            }

            // Validar valor unitario obligatorio
            if (!p.vUnitario || parseFloat(p.vUnitario) <= 0) {
                alert(`⚠️ Producto ${i + 1}: Valor Unitario es obligatorio y debe ser mayor a 0.`);
                return false;
            }

            // Validar cantidad obligatoria
            if (!p.cantidad || parseFloat(p.cantidad) <= 0) {
                alert(`⚠️ Producto ${i + 1}: Cantidad es obligatoria y debe ser mayor a 0.`);
                return false;
            }

            // Validar código duplicado
            const duplicado = await validarCodigoDuplicado(p.codigo, i);
            if (duplicado && !p.producto_id) {
                // Solo es error si es nuevo y hay duplicado
                const encontradoEnFactura = productosFactura.some((prod, idx) => 
                    idx !== i && prod.codigo === p.codigo && prod.codigo
                );
                if (encontradoEnFactura) {
                    alert(`⚠️ Producto ${i + 1}: El código ${p.codigo} ya existe en esta factura.`);
                    return false;
                }
            }
        }

        return true;
    };


    // ==========================================
    // 7. BOTONES CREAR FACTURA Y CANCELAR
    // ==========================================
    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        
        // Validar estado de pago
        if (pagoEstado === 'Default') {
            alert("⚠️ Seleccione el estado de pago.");
            return false;
        }

        // Validar cliente
        if (!await validarDatosCliente()) return false;

        // Validar productos
        if (!await validarProductos()) return false;

        const token = sessionStorage.getItem('token');
        let clienteIdActual = cliente.id;

        // Guardar o actualizar cliente
        if (!clienteIdActual) {
            clienteIdActual = await guardarOActualizarCliente(token);
            if (!clienteIdActual) return false;
        } else {
            // Si el cliente existe pero fue modificado, actualizar
            if (clienteModificado) {
                const actualizado = await guardarOActualizarCliente(token);
                if (!actualizado) return false;
                clienteIdActual = actualizado;
            }
        }

        // Verificar si hay productos nuevos y mostrar advertencia
        const productosValidados = productosFactura.filter(p => p.codigo?.trim());
        const hayProductosNuevos = productosValidados.some((p, idx) => productosNuevos.has(idx));

        if (hayProductosNuevos) {
            const productosNuevosNombres = productosValidados
                .filter((p, idx) => productosNuevos.has(idx))
                .map(p => `"${p.codigo}"`)
                .join(", ");

            const confirmar = window.confirm(
                `⚠️ Los siguientes productos no existen en la base de datos: ${productosNuevosNombres}\n\n¿Deseas agregar estos productos nuevos y continuar creando la factura?`
            );

            if (!confirmar) return false;
        }

        // Guardar/actualizar productos
        const productosConIds = [];
        for (let i = 0; i < productosFactura.length; i++) {
            const p = productosFactura[i];
            if (!p.codigo?.trim()) continue;

            const productoId = await guardarOActualizarProducto(token, i);
            if (!productoId) {
                alert(`❌ Error al guardar el producto ${p.codigo}`);
                return false;
            }

            productosConIds.push({
                producto_id: productoId,
                cantidad: p.cantidad,
                precio: p.vUnitario,
                subtotal: p.vTotal,
                ivaPorcentaje: p.ivaPorcentaje
            });
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
                    productos: productosConIds
                })
            });

            if (response.ok) {
                alert("✅ Factura guardada correctamente");
                navigate('/facturas');
                return true;
            } else {
                const errorData = await response.json();
                alert("❌ Error: " + (errorData.message || "No se pudo guardar"));
                return false;
            }
        } catch (err) {
            alert("❌ Error de conexión");
            return false;
        }
    };
    
    // Retorno unificado para el componente
    return {
        // Estado Pago
        pagoEstado, setPagoEstado,
        // Numero/Fecha
        numeroFactura, fechaEmision, setFechaEmision,
        // Cliente
        identificacion, setIdentificacion, seleccionarCliente, cliente, sugerencias, autocompletarClienteConTab,
        handleClienteChange: (e) => {
            setCliente(prev => ({ ...prev, [e.target.name]: e.target.value }));
            setClienteModificado(true);
        },
        // Productos
        productosFactura, sugerenciasProd, buscarProductos, handleInputChange, autocompletarProductoConTab,
        agregarFilaProducto: () => setProductosFactura([...productosFactura, { producto_id: null, codigo: '', cantidad: 1, detalle: '', vUnitario: 0, vTotal: 0, ivaPorcentaje: 0 }]),
        eliminarFilaProducto: (i) => { if (productosFactura.length > 1) setProductosFactura(productosFactura.filter((_, idx) => idx !== i)) },
        // Valores
        subtotal, iva, totalGeneral,
        // Acciones Finales
        handleSubmit
    };
};