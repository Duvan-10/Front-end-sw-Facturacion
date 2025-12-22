import { useState, useEffect } from 'react';


{/*****LOGICA---NUMERO--DE---FACTURA-----FECHA***********/}

export const useInvoiceLogic = () => {
   
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
    
    // Actualizamos el valor del campo que cambió (codigo o cantidad)
    nuevosProductos[index][campo] = valor;

    // Si el usuario está escribiendo en el código, buscamos si ya existe en nuestras sugerencias
    if (campo === 'codigo') {
        const encontrado = sugerenciasProd.find(p => 
            String(p.codigo) === String(valor) || String(p.nombre) === String(valor)
        );

        if (encontrado) {
            nuevosProductos[index].producto_id = encontrado.id;
            nuevosProductos[index].codigo = encontrado.codigo;
            nuevosProductos[index].detalle = encontrado.nombre;
            nuevosProductos[index].vUnitario = encontrado.precio;
        }
    }

    // SIEMPRE recalculamos el total de la fila (vTotal)
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

return {
        numeroFactura, 
        fechaEmision, 
        identificacion, 
        seleccionarCliente, 
        cliente, 
        sugerencias,
        productosFactura,
        sugerenciasProd,
        buscarProductos,
        agregarFilaProducto,
        eliminarFilaProducto,
        handleInputChange 
    };
};