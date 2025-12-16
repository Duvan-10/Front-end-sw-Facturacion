import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import "../styles1.css";

// =======================================================
// COMPONENTE: ClientForm (Con Guardado Real y Notificación)
// =======================================================

const ClientForm = () => {
    
    const { id } = useParams();
    const isEditing = !!id;

    // Simulación de URL base de la API (AJUSTA ESTO A TU BACKEND REAL)
    const apiBaseUrl = 'http://localhost:8080/api/clientes'; 

    // Estado inicial
    const [clientData, setClientData] = useState({
        nit: '',
        name: '',
        phone: '',
        address: '',
        email: '',
    });

    // --- I. LÓGICA DE CARGA POR URL (fetch de datos para edición) ---
    useEffect(() => {
        if (isEditing) {
            const fetchClientData = async () => {
                try {
                    // Nota: En un entorno de producción, es vital manejar tokens/seguridad aquí.
                    const response = await fetch(`${apiBaseUrl}/${id}`);
                    if (!response.ok) {
                        throw new Error('No se pudo cargar el cliente para edición.');
                    }
                    const data = await response.json();
                    setClientData(data);
                } catch (error) {
                    console.error("Error al cargar datos:", error);
                    alert(`Error al cargar los datos del cliente ${id}: ${error.message}`);
                }
            };
            fetchClientData();
        }
    }, [isEditing, id, apiBaseUrl]); // Se ejecuta al cambiar isEditing o id

    // Handler genérico para actualizar el estado del formulario
    const handleChange = (e) => {
        const { id, value } = e.target;
        setClientData(prev => ({
            ...prev,
            [id]: value
        }));
    };
    
    // --- II. HANDLERS DE ACCIÓN ---
    
    const handleCloseTab = () => {
        window.close();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        let url = apiBaseUrl;
        let method = 'POST';
        
        const finalData = { ...clientData };
        
        if (isEditing) {
            url = `${apiBaseUrl}/${id}`;
            method = 'PUT';
            finalData.id = id; 
        } else {
            // Asegura que el ID no se envíe si es un registro nuevo (para que la DB lo genere)
            delete finalData.id; 
        }

        try {
            console.log(`Enviando ${method} a: ${url}`, finalData);
            
            // LLAMADA REAL A LA API
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    // Incluye headers de autenticación si son necesarios
                },
                body: JSON.stringify(finalData),
            });

            if (!response.ok) {
                // Intenta leer el cuerpo del error si es posible
                const errorText = await response.text(); 
                throw new Error(`Error ${response.status}: ${errorText}`);
            }

            const savedClient = await response.json(); 
            
            const action = isEditing ? 'editó' : 'registró';
            alert(`✅ Cliente "${savedClient.name || finalData.name}" ${action} con éxito.`);
            
            // PASO CLAVE: Notificar a la ventana padre para que recargue
            if (window.opener) {
                window.opener.postMessage('listUpdated', '*'); 
            }

            // PASO CLAVE: Cerrar la pestaña
            handleCloseTab(); 

        } catch (error) {
            console.error("Error al guardar cliente:", error);
            alert(`❌ Error al guardar el cliente: ${error.message}. Por favor, verifica la URL de la API y el servidor.`);
        }
    };

    return ( 
        // 🚨 CAMBIO 1: Usar la clase global 'app-form' 
        <form className="app-form card" onSubmit={handleSubmit}>
            <h2 className="module-title" style={{ textAlign: 'center' }}>
                {isEditing ? `Editar Cliente #${id}` : 'Registrar Nuevo Cliente'}
            </h2>
            
            {/* 🚨 CAMBIO 2: Ya usa 'section-group', lo cual está correcto */}
            <div className="section-group client-data">
                
                {/* NIT/CC */}
                <div className="field-col">
                    <label htmlFor="nit">NIT/CC</label>
                    <input 
                        type="text" 
                        id="nit" 
                        placeholder="Identificación" 
                        value={clientData.nit || ''} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                
                {/* Razón Social / Nombre */}
                <div className="field-col">
                    <label htmlFor="name">Razón Social / Nombre</label>
                    <input type="text" id="name" placeholder="Nombre completo" value={clientData.name || ''} onChange={handleChange} required />
                </div>

                {/* Teléfono */}
                <div className="field-col">
                    <label htmlFor="phone">Teléfono</label>
                    <input type="text" id="phone" placeholder="Número contacto" value={clientData.phone || ''} onChange={handleChange} />
                </div>
                
                {/* Dirección */}
                <div className="field-col">
                    <label htmlFor="address">Dirección</label>
                    <input type="text" id="address" placeholder="Dirección" value={clientData.address || ''} onChange={handleChange} />
                </div>
                
                {/* Correo */}
                <div className="field-col">
                    <label htmlFor="email">Correo</label>
                    <input type="email" id="email" placeholder="Correo electrónico" value={clientData.email || ''} onChange={handleChange} />
                </div>
                
                {/* Aquí podríamos agregar un campo de observaciones si fuera necesario, usando la clase 'full-width' */}

            </div>

            {/* Botones de Acción */}
            {/* 🚨 CAMBIO 3: Usar la clase global 'final-buttons-group' y eliminar style inline */}
            <div className="final-buttons-group">
                <button 
                    type="submit" 
                    className="btn btn-success" 
                    style={{ width: '200px' }}
                >
                    {isEditing ? 'Guardar Cambios' : 'Registrar Cliente'}
                </button>
                
                <button 
                    type="button" 
                    className="btn btn-danger" 
                    onClick={handleCloseTab} 
                    style={{ width: '200px' }}
                >
                    Cerrar Pestaña
                </button>
            </div>
        </form>
    ); 
};

export default ClientForm;