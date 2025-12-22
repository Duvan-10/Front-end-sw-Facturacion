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
    return {
        numeroFactura, fechaEmision, setFechaEmision,
        identificacion, seleccionarCliente,
        cliente, sugerencias
    };
};