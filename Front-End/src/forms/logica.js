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
    getMensajeDetalleProductoIncorrecto,
    validarIdentificacionPorTipo,
    getMensajeErrorIdentificacion,
    normalizarTipoIdentificacion
} from '../utils/validations.js';

export const useInvoiceLogic = () => {
    const navigate = useNavigate();

    // ==========================================
    // CONSTANTES DE VALIDACIÓN
    // ==========================================
    const REGEX_PATTERNS = {
        identificacion: /^[0-9\s.-]*$/,
        nombre: /^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s.-]*$/,
        telefono: /^[0-9]*$/,
        direccion: /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚüÜ\s#-]*$/,
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        codigo: /^[a-zA-Z0-9_-]*$/,
        detalle: /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚüÜ\s.,-]*$/,
        numeroPositivo: /^[0-9]+(\.[0-9]+)?$/
    };

    const MENSAJE_ERROR = {
        identificacion: '⚠️ Carácter inválido: solo números, espacios, puntos y guiones',
        nombre: '⚠️ Carácter inválido: solo letras, espacios, puntos y guiones',
        telefono: '⚠️ Carácter inválido: solo números',
        telefonoMin: '⚠️ Mínimo 7 caracteres',
        direccion: '⚠️ Carácter inválido: solo letras, números, espacios, # y guiones',
        correo: '⚠️ Formato de correo inválido',
        codigo: '⚠️ Carácter inválido: solo letras, números, guiones y _',
        detalle: '⚠️ Carácter inválido: solo letras, números, espacios, puntos, comas y guiones',
        numeroPositivo: '⚠️ Solo números positivos',
        descuento: '⚠️ Descuento: 0-100%',
        noExiste: '⚠️ No existe '
    };

    // ==========================================
    // 1. NUMERO FACTURA Y FECHA
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

    const [fechaVencimiento, setFechaVencimiento] = useState(() => {
        const ahora = new Date();
        ahora.setDate(ahora.getDate() + 30); // 30 días por defecto
        return ahora.getFullYear() + "-" + 
               String(ahora.getMonth() + 1).padStart(2, '0') + "-" + 
               String(ahora.getDate()).padStart(2, '0');
    });

    const [identificacion, setIdentificacion] = useState('');
    const [sugerencias, setSugerencias] = useState([]);
    const [sugerenciasNombre, setSugerenciasNombre] = useState([]);
    const [cliente, setCliente] = useState({ 
        id: '', 
        tipo_identificacion: 'C.C.',
        nombre: '', 
        correo: '', 
        telefono: '', 
        direccion: '' 
    });
    const [clienteModificado, setClienteModificado] = useState(false);
    const [erroresCliente, setErroresCliente] = useState({
        identificacion: '',
        nombre: '',
        telefono: '',
        direccion: '',
        correo: ''
    });

    // Autocompletado para clientes por identificación
    useEffect(() => {
        const buscarCoincidencias = async () => {
            if (identificacion.length > 2) {
                try {
                    const token = sessionStorage.getItem('token');
                    const res = await fetch(`http://localhost:8080/api/clientes/buscar?term=${identificacion}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const resultados = await res.json();
                        setSugerencias(resultados);
                    }
                } catch (err) { console.error(err); }
            } else { setSugerencias([]); }
        };
        const timeoutId = setTimeout(buscarCoincidencias, 300);
        return () => clearTimeout(timeoutId);
    }, [identificacion]);

    // Autocompletado para clientes por nombre
    useEffect(() => {
        const buscarPorNombre = async () => {
            if (cliente.nombre.length > 2) {
                try {
                    const token = sessionStorage.getItem('token');
                    const res = await fetch(`http://localhost:8080/api/clientes/buscar?term=${cliente.nombre}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const resultados = await res.json();
                        setSugerenciasNombre(resultados);
                    }
                } catch (err) { console.error(err); }
            } else { setSugerenciasNombre([]); }
        };
        const timeoutId = setTimeout(buscarPorNombre, 300);
        return () => clearTimeout(timeoutId);
    }, [cliente.nombre]);

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

    // Selección de cliente sugerido por identificación
    const seleccionarCliente = (e) => {
        const valorIngresado = e.target.value;
        setIdentificacion(valorIngresado);
        setErroresCliente(prev => ({ ...prev, identificacion: '' }));
        
        const encontrado = sugerencias.find(c => 
            String(c.identificacion) === String(valorIngresado)
        );
        
        if (encontrado) {
            setIdentificacion(encontrado.identificacion); 
            setCliente({
                id: encontrado.id,
                tipo_identificacion: normalizarTipoIdentificacion(encontrado.tipo_identificacion),
                nombre: encontrado.nombre_razon_social,
                correo: encontrado.email,
                telefono: encontrado.telefono,
                direccion: encontrado.direccion
            });
            setClienteModificado(false);
            setErroresCliente({
                identificacion: '',
                nombre: '',
                telefono: '',
                direccion: '',
                correo: ''
            });
        } else {
            // Cliente no existe: limpiar campos y notificar
            if (valorIngresado.length > 0) {
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
        }
    };

    // Selección de cliente sugerido por nombre
    const seleccionarClientePorNombre = (clienteSugerido) => {
        setIdentificacion(clienteSugerido.identificacion);
        setCliente({
            id: clienteSugerido.id,
            tipo_identificacion: normalizarTipoIdentificacion(clienteSugerido.tipo_identificacion),
            nombre: clienteSugerido.nombre_razon_social,
            correo: clienteSugerido.email,
            telefono: clienteSugerido.telefono,
            direccion: clienteSugerido.direccion
        });
        setClienteModificado(false);
        setSugerenciasNombre([]);
        setErroresCliente({
            identificacion: '',
            nombre: '',
            telefono: '',
            direccion: '',
            correo: ''
        });
    };

    // Verificar si cliente existe al perder foco en identificación
    const verificarClienteExiste = async () => {
        if (identificacion.trim().length > 0 && !cliente.id) {
            const existe = await validarIdentificacionDuplicada(identificacion.trim());
            if (!existe) {
                setErroresCliente(prev => ({
                    ...prev,
                    identificacion: '⚠️ no existe '
                }));
            }
        }
    };

    // Verificar si cliente existe al perder foco en nombre
    const verificarNombreExiste = async () => {
        if (cliente.nombre.trim().length > 0 && !cliente.id) {
            try {
                const token = sessionStorage.getItem('token');
                const res = await fetch(`http://localhost:8080/api/clientes/buscar?term=${cliente.nombre}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const resultados = await res.json();
                    const encontrado = resultados.find(c => 
                        c.nombre_razon_social.toLowerCase() === cliente.nombre.toLowerCase()
                    );
                    if (!encontrado) {
                        setErroresCliente(prev => ({
                            ...prev,
                            nombre: '⚠️ no existe'
                        }));
                    }
                }
            } catch (err) {
                console.error(err);
            }
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

    // Función auxiliar para limpiar errores de cliente
    const limpiarErrorCliente = (campo) => {
        setErroresCliente(prev => ({ ...prev, [campo]: '' }));
    };

    // Función auxiliar para establecer error de cliente
    const establecerErrorCliente = (campo, mensaje) => {
        setErroresCliente(prev => ({ ...prev, [campo]: mensaje }));
    };

    // Validar caracteres en tiempo real - CLIENTES
    const validarCaracteresIdentificacion = (valor) => {
        if (!REGEX_PATTERNS.identificacion.test(valor)) {
            establecerErrorCliente('identificacion', MENSAJE_ERROR.identificacion);
            return false;
        }
        limpiarErrorCliente('identificacion');
        return true;
    };

    const validarCaracteresNombre = (valor) => {
        if (!REGEX_PATTERNS.nombre.test(valor)) {
            establecerErrorCliente('nombre', MENSAJE_ERROR.nombre);
            return false;
        }
        limpiarErrorCliente('nombre');
        return true;
    };

    const validarCaracteresTelefono = (valor) => {
        if (!REGEX_PATTERNS.telefono.test(valor)) {
            establecerErrorCliente('telefono', MENSAJE_ERROR.telefono);
            return false;
        }
        if (valor.length > 0 && valor.length < 7) {
            establecerErrorCliente('telefono', MENSAJE_ERROR.telefonoMin);
            return false;
        }
        limpiarErrorCliente('telefono');
        return true;
    };

    const validarCaracteresDireccion = (valor) => {
        if (!REGEX_PATTERNS.direccion.test(valor)) {
            establecerErrorCliente('direccion', MENSAJE_ERROR.direccion);
            return false;
        }
        limpiarErrorCliente('direccion');
        return true;
    };

    const validarCaracteresCorreo = (valor) => {
        if (valor.trim() === '') {
            limpiarErrorCliente('correo');
            return true;
        }
        if (!REGEX_PATTERNS.email.test(valor)) {
            establecerErrorCliente('correo', MENSAJE_ERROR.correo);
            return false;
        }
        limpiarErrorCliente('correo');
        return true;
    };

    // Validación de datos del cliente
    const validarDatosCliente = async () => {
        // Validar identificación
        if (!identificacion?.trim()) {
            alert("⚠️ Identificación obligatoria.");
            return false;
        }
        
        // Validar formato según tipo de documento
        if (!validarIdentificacionPorTipo(identificacion, cliente.tipo_identificacion)) {
            alert(getMensajeErrorIdentificacion(cliente.tipo_identificacion));
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
        { producto_id: null, codigo: '', cantidad: 1, detalle: '', vUnitario: 0, descuento: 0, vTotal:0, ivaPorcentaje: 0 }
    ]);
    const [sugerenciasProd, setSugerenciasProd] = useState([]);
    const [sugerenciasProdNombre, setSugerenciasProdNombre] = useState([]);
    const [productosNuevos, setProductosNuevos] = useState(new Set()); // Rastrear productos nuevos
    const [productosModificados, setProductosModificados] = useState(new Set()); // Productos existentes modificados
    const [erroresProductos, setErroresProductos] = useState([]); // Errores por producto [index: {campo: mensaje}]

    useEffect(() => {
      setErroresProductos((prev) => productosFactura.map((_, i) => prev[i] || {}));
    }, [productosFactura]);

    // Búsqueda de productos existentes por código
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

    // Búsqueda de productos por nombre/detalle
    const buscarProductosPorNombre = async (t) => {
        if (!t || t.length < 2) {
            setSugerenciasProdNombre([]);
            return;
        }
        try {
            const token = sessionStorage.getItem('token');
            const res = await fetch(`http://localhost:8080/api/facturas/buscar-productos?q=${t}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setSugerenciasProdNombre(await res.json());
        } catch (error) { console.error(error); }
    };

    // Funciones auxiliares para manejo de errores de productos
    const limpiarErrorProducto = (index, campo) => {
        setErroresProductos(prev => {
            const newErrors = [...prev];
            if (newErrors[index]) {
                delete newErrors[index][campo];
            }
            return newErrors;
        });
    };

    const establecerErrorProducto = (index, campo, mensaje) => {
        setErroresProductos(prev => {
            const newErrors = [...prev];
            if (!newErrors[index]) newErrors[index] = {};
            newErrors[index][campo] = mensaje;
            return newErrors;
        });
    };

    // Validar caracteres en tiempo real - PRODUCTOS
    const validarCaracteresCodigo = (valor, index) => {
        if (!REGEX_PATTERNS.codigo.test(valor)) {
            establecerErrorProducto(index, 'codigo', MENSAJE_ERROR.codigo);
            return false;
        }
        limpiarErrorProducto(index, 'codigo');
        return true;
    };

    const validarCaracteresDetalle = (valor, index) => {
        if (!REGEX_PATTERNS.detalle.test(valor)) {
            establecerErrorProducto(index, 'detalle', MENSAJE_ERROR.detalle);
            return false;
        }
        limpiarErrorProducto(index, 'detalle');
        return true;
    };

    const validarCaracteresNumero = (valor, campo, index) => {
        if (valor === '' || valor === null || valor === undefined) {
            limpiarErrorProducto(index, campo);
            return true;
        }
        if (!REGEX_PATTERNS.numeroPositivo.test(valor) || parseFloat(valor) < 0) {
            establecerErrorProducto(index, campo, MENSAJE_ERROR.numeroPositivo);
            return false;
        }
        limpiarErrorProducto(index, campo);
        return true;
    };

    const validarCaracteresCantidad = (valor, index) => validarCaracteresNumero(valor, 'cantidad', index);
    const validarCaracteresVUnitario = (valor, index) => validarCaracteresNumero(valor, 'vUnitario', index);
    
    const validarCaracteresDescuento = (valor, index) => {
        if (valor === '' || valor === null || valor === undefined) {
            limpiarErrorProducto(index, 'descuento');
            return true;
        }
        const num = parseFloat(valor);
        if (!REGEX_PATTERNS.numeroPositivo.test(valor) || num < 0 || num > 100) {
            establecerErrorProducto(index, 'descuento', MENSAJE_ERROR.descuento);
            return false;
        }
        limpiarErrorProducto(index, 'descuento');
        return true;
    };

    // Validar caracteres en campos de producto (compatibilidad con validations.js)
    const esCodigoValidoLocal = (codigo) => esCodigoValido(codigo);
    const esDetalleValidoLocal = (detalle) => esDetalleValido(detalle);
    const esValorValido = (valor) => !isNaN(parseFloat(valor)) && parseFloat(valor) > 0;

    // Verificar si producto existe por código
    const verificarProductoExiste = async (index, codigo) => {
        if (!codigo || codigo.trim().length === 0) return;
        const producto = productosFactura[index];
        if (!producto.producto_id) {
            const existe = await validarCodigoDuplicado(codigo.trim(), index);
            if (!existe) {
                establecerErrorProducto(index, 'codigo', MENSAJE_ERROR.noExiste);
            }
        }
    };

    // Verificar si producto existe por nombre/detalle
    const verificarProductoExistePorNombre = async (index, detalle) => {
        if (!detalle || detalle.trim().length < 2) return;
        const producto = productosFactura[index];
        if (!producto.producto_id) {
            try {
                const token = sessionStorage.getItem('token');
                const res = await fetch(`http://localhost:8080/api/facturas/buscar-productos?q=${detalle}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const resultados = await res.json();
                    const encontrado = resultados.find(p => 
                        p.nombre.toLowerCase() === detalle.toLowerCase()
                    );
                    if (!encontrado) {
                        establecerErrorProducto(index, 'detalle', MENSAJE_ERROR.noExiste);
                    }
                }
            } catch (err) {
                console.error(err);
            }
        }
    };

    // Seleccionar producto desde sugerencias de nombre
    const seleccionarProductoPorNombre = (productoSugerido, index) => {
        const nuevos = [...productosFactura];
        nuevos[index].codigo = productoSugerido.codigo;
        nuevos[index].producto_id = productoSugerido.id;
        nuevos[index].detalle = productoSugerido.nombre + 
            (productoSugerido.descripcion ? ` - ${productoSugerido.descripcion}` : "");
        nuevos[index].vUnitario = parseFloat(productoSugerido.precio) || 0;
        nuevos[index].descuento = 0;
        nuevos[index].ivaPorcentaje = parseFloat(productoSugerido.impuesto_porcentaje) || 0;
        
        const subtotalProd = (parseFloat(nuevos[index].cantidad) || 0) * (parseFloat(nuevos[index].vUnitario) || 0);
        const descuentoProd = subtotalProd * ((parseFloat(nuevos[index].descuento) || 0) / 100);
        nuevos[index].vTotal = subtotalProd - descuentoProd;
        
        setProductosFactura(nuevos);
        setSugerenciasProdNombre([]);
        
        // Limpiar errores
        setErroresProductos(prev => {
            const newErrors = [...prev];
            newErrors[index] = {};
            return newErrors;
        });
        
        // Marcar como producto existente
        const nuevosProductos = new Set(productosNuevos);
        nuevosProductos.delete(index);
        setProductosNuevos(nuevosProductos);
    };

    // Validar código duplicado
    const validarCodigoDuplicado = async (codigo, excluyendoIndex = null) => {
        if (!codigo.trim()) return false;
        
        // Validar solo en la lista de productos de la factura actual
        for (let i = 0; i < productosFactura.length; i++) {
            if (i !== excluyendoIndex && productosFactura[i].codigo === codigo.trim() && productosFactura[i].codigo) {
                return true; // Está duplicado en el formulario
            }
        }

        // No validar contra BD: permitir crear nuevos productos
        return false;
    };

    // Manejo de cambios en los inputs de productos con validación
    const handleInputChange = (index, campo, valor) => {
        const nuevos = [...productosFactura];
        const productoActual = nuevos[index];

        if (campo === 'codigo') {
            // Validar caracteres
            validarCaracteresCodigo(valor, index);
            productoActual.codigo = valor;

            // Buscar producto en sugerencias por código
            const productoEncontrado = sugerenciasProd.find(p => 
                String(p.codigo).toLowerCase() === String(valor).toLowerCase()
            );
            
            if (productoEncontrado) {
                // Autocompletar todos los campos
                productoActual.codigo = productoEncontrado.codigo;
                productoActual.producto_id = productoEncontrado.id;
                productoActual.detalle = productoEncontrado.nombre + 
                    (productoEncontrado.descripcion ? ` - ${productoEncontrado.descripcion}` : "");
                productoActual.vUnitario = parseFloat(productoEncontrado.precio) || 0;
                productoActual.descuento = 0;
                productoActual.ivaPorcentaje = parseFloat(productoEncontrado.impuesto_porcentaje) || 0;
                
                // Limpiar errores
                setErroresProductos(prev => {
                    const newErrors = [...prev];
                    newErrors[index] = {};
                    return newErrors;
                });
                
                // Marcar como producto existente
                const nuevosProductos = new Set(productosNuevos);
                nuevosProductos.delete(index);
                setProductosNuevos(nuevosProductos);
            } else if (valor.trim().length > 0) {
                // Producto no existe en BD: limpiar campos de detalle
                productoActual.producto_id = null;
                productoActual.detalle = '';
                productoActual.vUnitario = 0;
                productoActual.descuento = 0;
                productoActual.ivaPorcentaje = 0;
            }
        } else if (campo === 'cantidad') {
            validarCaracteresCantidad(valor, index);
            productoActual.cantidad = valor;
        } else if (campo === 'detalle') {
            validarCaracteresDetalle(valor, index);
            productoActual.detalle = valor;
            
            // Si hay producto_id, marcar como modificado
            if (productoActual.producto_id) {
                const nuevosModificados = new Set(productosModificados);
                nuevosModificados.add(index);
                setProductosModificados(nuevosModificados);
            }
        } else if (campo === 'vUnitario') {
            validarCaracteresVUnitario(valor, index);
            productoActual.vUnitario = valor;
            
            // Si hay producto_id, marcar como modificado
            if (productoActual.producto_id) {
                const nuevosModificados = new Set(productosModificados);
                nuevosModificados.add(index);
                setProductosModificados(nuevosModificados);
            }
        } else if (campo === 'descuento') {
            validarCaracteresDescuento(valor, index);
            productoActual.descuento = valor;
        }

        // Calcular vTotal con descuento
        const subtotalProducto = (parseFloat(productoActual.cantidad) || 0) * (parseFloat(productoActual.vUnitario) || 0);
        const descuentoAplicado = subtotalProducto * ((parseFloat(productoActual.descuento) || 0) / 100);
        productoActual.vTotal = subtotalProducto - descuentoAplicado;
        
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
            nuevos[index].descuento = 0;
            nuevos[index].ivaPorcentaje = parseFloat(productoSugerido.impuesto_porcentaje) || 0;
            const subtotalProd = (parseFloat(nuevos[index].cantidad) || 0) * (parseFloat(nuevos[index].vUnitario) || 0);
            const descuentoProd = subtotalProd * ((parseFloat(nuevos[index].descuento) || 0) / 100);
            nuevos[index].vTotal = subtotalProd - descuentoProd;
            
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
        
        // Validar fecha vencimiento
        if (!fechaVencimiento.trim()) {
            alert("⚠️ Debe especificar la fecha de vencimiento.");
            return false;
        }

        // Validar cliente (mantener datos en caso de error)
        const clienteValido = await validarDatosCliente();
        if (!clienteValido) return false;

        // Validar productos (mantener datos en caso de error)
        const productosValidos = await validarProductos();
        if (!productosValidos) return false;

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
                descuento: p.descuento || 0,
                subtotal: p.vTotal,
                ivaPorcentaje: p.ivaPorcentaje
            });
        }

        // Calcular descuento promedio de los productos (para guardar en facturas.descuento)
        const descuentoPromedio = productosFactura.length > 0
            ? productosFactura.reduce((sum, p) => sum + (parseFloat(p.descuento) || 0), 0) / productosFactura.length
            : 0;

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
                    fecha_vencimiento: fechaVencimiento,
                    fecha_creacion: fechaFinalFactura,
                    subtotal: subtotal,
                    iva: iva,
                    total: totalGeneral,
                    descuento_porcentaje: descuentoPromedio,
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
    
    // Manejo de cambios en campos de cliente con validación en tiempo real
    const handleClienteChange = (e) => {
        const { name, value } = e.target;
        
        // Validar caracteres según el campo
        let esValido = true;
        switch(name) {
            case 'nombre':
                esValido = validarCaracteresNombre(value);
                break;
            case 'telefono':
                esValido = validarCaracteresTelefono(value);
                break;
            case 'direccion':
                esValido = validarCaracteresDireccion(value);
                break;
            case 'correo':
                esValido = validarCaracteresCorreo(value);
                break;
            default:
                break;
        }
        
        // Actualizar el valor incluso si no es válido (para mostrar el error)
        setCliente(prev => ({ ...prev, [name]: value }));
        setClienteModificado(true);
    };

    // Manejo de cambios en identificación con validación
    const handleIdentificacionChange = (e) => {
        const valor = e.target.value;
        validarCaracteresIdentificacion(valor);
        seleccionarCliente(e);
    };

    // Retorno unificado para el componente
    return {
        // Numero/Fecha
        numeroFactura, fechaEmision, setFechaEmision, fechaVencimiento, setFechaVencimiento,
        // Cliente
        identificacion, setIdentificacion, seleccionarCliente, cliente, sugerencias, sugerenciasNombre,
        autocompletarClienteConTab, seleccionarClientePorNombre, verificarClienteExiste, verificarNombreExiste,
        handleClienteChange, handleIdentificacionChange, erroresCliente,
        // Productos
        productosFactura, sugerenciasProd, sugerenciasProdNombre, buscarProductos, buscarProductosPorNombre,
        handleInputChange, autocompletarProductoConTab, seleccionarProductoPorNombre,
        verificarProductoExiste, verificarProductoExistePorNombre, erroresProductos,
        agregarFilaProducto: () => {
            setProductosFactura([...productosFactura, { producto_id: null, codigo: '', cantidad: 1, detalle: '', vUnitario: 0, descuento: 0, vTotal: 0, ivaPorcentaje: 0 }]);
        },
        eliminarFilaProducto: (i) => { 
            if (productosFactura.length > 1) {
                setProductosFactura(productosFactura.filter((_, idx) => idx !== i));
                // Limpiar errores del producto eliminado
                setErroresProductos(prev => prev.filter((_, idx) => idx !== i));
            }
        },
        // Valores
        subtotal, iva, totalGeneral,
        // Acciones Finales
        handleSubmit
    };
};