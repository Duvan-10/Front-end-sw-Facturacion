// Front-end/src/modules/Clientes/Clientes.jsx (Versión Final Corregida)

import React, { useState, useEffect } from 'react'; 
import axios from 'axios'; 


const API_URL = 'http://localhost:3000/api/clientes'; 

function ClientManagement() {
    // 1. Estados (Tu código es correcto aquí)
    const [formData, setFormData] = useState({
        tipoDocumento: '', 
        identificacion: '', 
        razonSocial: '',
        telefono: '',
        direccion: '',
        correo: '',
    });
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null); 

    // ... (fetchClients es correcto, no necesita cambios) ...

    const fetchClients = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(API_URL, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            setClients(response.data);
            setError(null);

        } catch (error) {
            console.error("Error al obtener clientes:", error);
            setError('Error al cargar clientes desde el servidor. Token inválido o expirado.');
        } finally {
            setLoading(false); 
        }
    };

    // 🚨 EFECTO: Cargar clientes al montar el componente
    useEffect(() => {
        fetchClients();
    }, []); 

    // Maneja el cambio en los inputs del formulario (Correcto)
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
    };

    // =======================================================
    // II. FUNCIÓN CORREGIDA PARA REGISTRAR (POST)
    // =======================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Validación de campos obligatorios (DEBE IR AQUÍ)
    if (!formData.tipoDocumento || !formData.identificacion || !formData.razonSocial) {
        alert("Los campos Tipo de Documento, Identificación y Razón Social son obligatorios.");
        return;
    }

    // 2. Mapeo de datos para el Backend (DEBE IR AQUÍ)
    const clientData = {
        tipo_identificacion: formData.tipoDocumento, 
        identificacion: formData.identificacion,
        nombre_razon_social: formData.razonSocial, 
        telefono: formData.telefono,
        direccion: formData.direccion,
        email: formData.correo, 
    };

    try {
        const token = localStorage.getItem('token'); 
        
        // 3. Petición POST al servidor con el Token
        await axios.post(API_URL, clientData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        alert(`Cliente ${clientData.nombre_razon_social} registrado en DB con éxito.`);
        
        // 4. RECARGAR DATOS y limpiar formulario
        fetchClients(); 
        
        setFormData({ 
            tipoDocumento: '', 
            identificacion: '', 
            razonSocial: '', 
            telefono: '', 
            direccion: '', 
            correo: '' 
        });

    } catch (error) {
        console.error("Error al registrar cliente:", error.response ? error.response.data : error.message);
        
        let message = error.response?.data?.message || error.message;

        // Si el token es inválido (401/403)
        if (error.response?.status === 401 || error.response?.status === 403) {
             message = "Sesión expirada o token inválido. Por favor, vuelva a iniciar sesión.";
        }

        alert(`Error al registrar cliente: ${message}`);
    }
};

    // =======================================================
    // III. RENDERIZADO (Tu código es correcto aquí)
    // =======================================================
    return (
       <>
        <header>Gestión de Clientes</header>

        {/* --- Formulario de registro --- */}
        <section className="form-section">
            <h2>Registrar nuevo cliente</h2>
            <form onSubmit={handleSubmit}>
                
                <label htmlFor="tipoDocumento">Tipo de Documento:</label>
                <select id="tipoDocumento" value={formData.tipoDocumento} onChange={handleChange} required>
                    <option value="">Seleccione...</option>
                    <option value="NIT">NIT</option>
                    <option value="CC">Cédula de Ciudadanía (CC)</option>
                </select>

                <label htmlFor="identificacion">NIT/CC (Número):</label>
                <input type="text" id="identificacion" value={formData.identificacion} onChange={handleChange} required />

                <label htmlFor="razonSocial">Razón Social/Nombre:</label>
                <input type="text" id="razonSocial" value={formData.razonSocial} onChange={handleChange} required />

                <label htmlFor="telefono">Teléfono:</label>
                <input type="text" id="telefono" value={formData.telefono} onChange={handleChange} />

                <label htmlFor="direccion">Dirección:</label>
                <input type="text" id="direccion" value={formData.direccion} onChange={handleChange} required />

                <label htmlFor="correo">Correo electrónico:</label>
                <input type="email" id="correo" value={formData.correo} onChange={handleChange} required />

                <button type="submit" className="btn">Registrar Cliente</button>
            </form>
        </section>

        {/* --- Listado de clientes --- */}
        <section className="list-section">
            <h2>Clientes registrados</h2>
            
            {loading ? (
                <div style={{ padding: '20px', textAlign: 'center' }}>Cargando lista desde la base de datos...</div>
            ) : error ? (
                <div style={{ color: 'red', padding: '20px', border: '1px solid red' }}>{error}</div>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Tipo Doc.</th>
                            <th>Identificación</th>
                            <th>Razón Social/Nombre</th>
                            <th>Teléfono</th>
                            <th>Correo</th>
                            <th>Dirección</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.length === 0 ? (
                            <tr><td colSpan="7" style={{textAlign: 'center'}}>No hay clientes registrados en la base de datos.</td></tr>
                        ) : (
                            clients.map((client, index) => (
                                <tr key={client.id || index}> 
                                    <td>{client.id}</td>
                                    <td>{client.tipo_identificacion}</td>
                                    <td>{client.identificacion}</td>
                                    <td>{client.nombre_razon_social}</td>
                                    <td>{client.telefono}</td>
                                    <td>{client.email}</td>
                                    <td>{client.direccion}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}
        </section>
    </>
);
} // 🚨 Cierre de la función ClientManagement

export default ClientManagement;


