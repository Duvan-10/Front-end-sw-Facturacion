import { useState, useEffect } from 'react';





export const useInvoiceLogic = () => {

    {/*****----PAGO--SI---NO----***********/}
      const [pagoEstado, setPagoEstado] = useState('Default');

     const handleSubmit = async (e) => {
     e.preventDefault();

     // VALIDACIÓN DE PAGO
     if (pagoEstado === 'Default') {
        alert("⚠️ Por favor, seleccione si la factura está pagada (Si / No) antes de continuar.");
        return;} // Esto detiene la ejecución y no envía nada al servidor

      // Si pasa la validación, procedemos con el envío...
     console.log("Enviando factura...");
    
     const datosFactura = {
        pago: pagoEstado, 
        cliente_id: cliente.id,
        productos: productosFactura,
        subtotal,
        iva,
        total: totalGeneral};
    
        };


{/*****LOGICA---NUMERO--DE---FACTURA-----FECHA***********/}
   
   //ESTADO PARA NUMERO DE FACTURA - FECHA
    const [numeroFactura, setNumeroFactura] = useState('Cargando...');
    const [fechaEmision, setFechaEmision] = useState(new Date().toISOString().split('T')[0]);

    //FUNCION FIJAR #FACTURA-FECHA
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



{/****************LOGICA CLIENTES**************************/}
// ESTADOS PARA CLIENTE
const [identificacion, setIdentificacion] = useState('');
const [sugerencias, setSugerencias] = useState([]); // Lista de clientes encontrados
const [cliente, setCliente] = useState({ nombre: '', correo: '', telefono: '', direccion: '' });

    // FUNCION buscar mientras escribe

    useEffect(() => {
        const buscarCoincidencias = async () => {
            if (identificacion.length > 2) { // Solo busca si hay más de 2 caracteres
                try {
                    const token = sessionStorage.getItem('authToken');
                    // Buscamos por coincidencia parcial (ej: /api/clientes/buscar?q=123)
                    const res = await fetch(`http://localhost:8080/api/clientes?search=${identificacion}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setSugerencias(data); // Guardamos la lista de posibles clientes
                    }
                } catch (err) {
                    console.error("Error en autocompletado:", err);
                }
            } else {
                setSugerencias([]);
            }
        };

        const timeoutId = setTimeout(buscarCoincidencias, 300); // Debounce para no saturar el server
        return () => clearTimeout(timeoutId);
    }, [identificacion]);



         // Función para cuando el usuario SELECCIONA un cliente
         const seleccionarCliente = (e) => {
         const valorIngresado = e.target.value;
         setIdentificacion(valorIngresado);

          // --- LOG PARA DEPURAR ---
          console.log("Sugerencias actuales:", sugerencias);
          console.log("Buscando ID:", valorIngresado);

          // Buscamos si el valor ingresado coincide con alguna sugerencia
         const encontrado = sugerencias.find(c => String(c.identificacion) === String(valorIngresado));
         
         if (encontrado) {
         console.log("¡Cliente encontrado! Datos:", encontrado); // Veremos qué nombres de campos trae
         // Si lo encuentra, llenamos el objeto cliente
           setCliente({
            nombre: encontrado.nombre_razon_social,
            correo: encontrado.email,
            telefono: encontrado.telefono || '',
            direccion: encontrado.direccion || ''
        });
    } else {
        // Si borra el ID, limpiamos los campos
        setCliente({ nombre: '', correo: '', telefono: '', direccion: '' });
    }
};
    

{/*******************LOGICA PRODUCTOS********************/}

// --- ESTADOS PRODUCTOS ---
const [productosFactura, setProductosFactura] = useState([
    { codigo: '', cantidad: 1, detalle: '', vUnitario: 0, vTotal: 0 }
]);
const [sugerenciasProd, setSugerenciasProd] = useState([]);

// --- ESTA ES LA FUNCIÓN QUE TU HTML NECESITA ---
const handleInputChange = (index, campo, valor) => {
const nuevosProductos = [...productosFactura];
nuevosProductos[index][campo] = valor;

    // Si el usuario está escribiendo en el código, buscamos si ya existe en nuestras sugerencias
    if (campo === 'codigo') {
        const encontrado = sugerenciasProd.find(p => String(p.codigo) === String(valor));
        if (encontrado) {
            nuevosProductos[index].producto_id = encontrado.id;
            nuevosProductos[index].detalle = `${encontrado.nombre} - ${encontrado.descripcion || ''}`;
            nuevosProductos[index].vUnitario = encontrado.precio;
            nuevosProductos[index].ivaPorcentaje = encontrado.impuesto_porcentaje || 0;
        }
    }

    // Recalcular fila
    const cant = parseFloat(nuevosProductos[index].cantidad) || 0;
    const precio = parseFloat(nuevosProductos[index].vUnitario) || 0;
    nuevosProductos[index].vTotal = cant * precio;

    setProductosFactura(nuevosProductos);
};

// --- FASE 1: BUSCAR EN BACKEND ---
const buscarProductos = async (termino) => {
    if (!termino || termino.length < 1) return;
    try {
        const token = sessionStorage.getItem('authToken'); // Usamos el mismo que en clientes
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

// --- FASE 2: AÑADIR ---
const agregarFilaProducto = () => {
    setProductosFactura([...productosFactura, { codigo: '', cantidad: 1, detalle: '', vUnitario: 0, vTotal: 0 }]);
};

// --- FASE 3: ELIMINAR ---
const eliminarFilaProducto = (index) => {
    if (productosFactura.length > 1) {
        setProductosFactura(productosFactura.filter((_, i) => i !== index));
    }
};


// --- CÁLCULOS DE TOTALES ---
const subtotal = productosFactura.reduce((acc, prod) => acc + (parseFloat(prod.vTotal) || 0), 0);

// Calculamos el IVA sumando el impuesto de cada fila
const valorIva = productosFactura.reduce((acc, prod) => {
    const impuesto = (parseFloat(prod.vTotal) || 0) * ((parseFloat(prod.ivaPorcentaje) || 0) / 100);
    return acc + impuesto;
}, 0);

const totalFinal = subtotal + valorIva;

// --- EL RETURN UNIFICADO ---
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
    subtotal, 
    iva: valorIva, 
    totalGeneral: totalFinal };

};