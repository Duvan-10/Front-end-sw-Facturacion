import { useState, useEffect } from 'react';

export const useClienteLogic = () => {
    const [identificacion, setIdentificacion] = useState('');
    const [sugerencias, setSugerencias] = useState([]);
    const [cliente, setCliente] = useState({ id: '', nombre: '', correo: '', telefono: '', direccion: '' });

    // --- AUTOCOMPLETADO DE CLIENTES ---
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

    const validarDatosCliente = () => {
        const regexSoloNumeros = /^[0-9]+$/;
        const regexSoloLetras = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s.]+$/; 
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!identificacion?.trim() || !regexSoloNumeros.test(identificacion)) { 
            alert("⚠️ Identificación obligatoria y solo numérica."); return false; 
        }
        if (!cliente.nombre?.trim() || !regexSoloLetras.test(cliente.nombre)) { 
            alert("⚠️ Nombre obligatorio y solo letras."); return false; 
        }
        if (!cliente.telefono?.trim() || !regexSoloNumeros.test(cliente.telefono) || cliente.telefono.length < 7) { 
            alert("⚠️ Teléfono obligatorio (mín. 7 dígitos)."); return false; 
        }
        if (cliente.correo?.trim() && !regexEmail.test(cliente.correo)) {
            alert("⚠️ Formato de correo incorrecto."); return false;
        }
        return true;
    };

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
            alert("❌ Error: " + data.message);
            return null;
        } catch (err) {
            alert("❌ Error de conexión al registrar cliente.");
            return null;
        }
    };

    return {
        identificacion, setIdentificacion,
        cliente, setCliente,
        sugerencias,
        seleccionarCliente,
        validarDatosCliente,
        registrarClienteRapido,
        handleClienteChange: (e) => setCliente(prev => ({ ...prev, [e.target.name]: e.target.value }))
    };
};