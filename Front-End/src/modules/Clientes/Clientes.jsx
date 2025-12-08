// Front-end/src/modules/Clientes/Clientes.jsx (Versión con Búsqueda y Paginación)

import React, { useState, useEffect, useMemo } from 'react'; 
import axios from 'axios'; 
import './Clientes.css'; // Asegúrate de que el CSS esté importado

const API_URL = 'http://localhost:3000/api/clientes'; 
const ITEMS_PER_PAGE = 30; // Definimos el límite de paginación

function ClientManagement() {
    // 1. Estados
    const [formData, setFormData] = useState({
        tipoDocumento: '', 
        identificacion: '', 
        razonSocial: '',
        telefono: '',
        direccion: '',
        correo: '',
    });
    const [clients, setClients] = useState([]); // Almacena TODOS los clientes
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null); 
    
    // 🚨 NUEVOS ESTADOS PARA DISEÑO Y FILTRO
    const [showForm, setShowForm] = useState(false); // Controla la visibilidad del formulario
    const [searchTerm, setSearchTerm] = useState(''); // Controla el texto de búsqueda
    const [currentPage, setCurrentPage] = useState(1); // Controla la página actual

    // =======================================================
    // I. FUNCIÓN PARA CARGAR DATOS (GET)
    // =======================================================

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
    // II. FUNCIÓN PARA REGISTRAR (POST)
    // =======================================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.tipoDocumento || !formData.identificacion || !formData.razonSocial) {
            alert("Los campos Tipo de Documento, Identificación y Razón Social son obligatorios.");
            return;
        }

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
            
            await axios.post(API_URL, clientData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            alert(`Cliente ${clientData.nombre_razon_social} registrado en DB con éxito.`);
            
            fetchClients(); // Recarga los datos y se muestra el más reciente.
            setShowForm(false); // Oculta el formulario después del registro
            
            setFormData({ // Limpia el formulario
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
            if (error.response?.status === 401 || error.response?.status === 403) {
                 message = "Sesión expirada o token inválido.";
            }

            alert(`Error al registrar cliente: ${message}`);
        }
    };


    // =======================================================
    // III. LÓGICA DE FILTRADO Y PAGINACIÓN (useMemo)
    // =======================================================
    const paginatedClients = useMemo(() => {
        // 1. FILTRADO (Por identificación o nombre/razón social)
        const filteredClients = clients.filter(client => {
            const search = searchTerm.toLowerCase();
            const idMatch = client.identificacion.toLowerCase().includes(search);
            const nameMatch = client.nombre_razon_social.toLowerCase().includes(search);
            return idMatch || nameMatch;
        });

        // 2. PAGINACIÓN (Limitar a 30 por página)
        const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        
        const currentClients = filteredClients.slice(startIndex, endIndex);

        return {
            currentClients,
            totalPages,
            totalClients: filteredClients.length // Total después del filtro
        };
    }, [clients, searchTerm, currentPage]); // Re-calcular solo si estos estados cambian


    // =======================================================
    // IV. RENDERIZADO
    // =======================================================
    return (
        <>
            <header>Gestión de Clientes</header>

            {/* --- CONTROLES Y BOTÓN DE REGISTRO --- */}
            <section className="controls-section" style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0' }}>
                <div className="search-bar">
                    <label htmlFor="search">Buscar Cliente (ID o Nombre): </label>
                    <input 
                        type="text" 
                        id="search" 
                        placeholder="Escribe aquí para búsqueda rápida..."
                        value={searchTerm} 
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1); // Resetear a la página 1 al buscar
                        }}
                    />
                </div>
                
                {/* Botón para mostrar/ocultar el formulario */}
                <button 
                    className="btn" 
                    onClick={() => setShowForm(!showForm)}
                    style={{ backgroundColor: showForm ? '#dc3545' : '#28a745' }} // Rojo si está visible, Verde si está oculto
                >
                    {showForm ? 'Cancelar Registro' : 'Registrar Nuevo Cliente'}
                </button>
            </section>

            {/* --- Formulario de registro (CONDICIONAL) --- */}
            {showForm && (
                <section className="form-section">
                    <h2>Registrar nuevo cliente</h2>
                    <form onSubmit={handleSubmit}>
                        {/* El resto de tus inputs de formulario */}
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
            )}

            {/* --- Listado de clientes --- */}
            <section className="list-section">
                <h2>Clientes registrados ({paginatedClients.totalClients} en total)</h2>
                
                {loading ? (
                    <div style={{ padding: '20px', textAlign: 'center' }}>Cargando lista desde la base de datos...</div>
                ) : error ? (
                    <div style={{ color: 'red', padding: '20px', border: '1px solid red' }}>{error}</div>
                ) : (
                    <>
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
                                {paginatedClients.currentClients.length === 0 ? (
                                    <tr><td colSpan="7" style={{textAlign: 'center'}}>{searchTerm ? "No hay clientes que coincidan con la búsqueda." : "No hay clientes registrados en la base de datos."}</td></tr>
                                ) : (
                                    paginatedClients.currentClients.map((client, index) => (
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
                        
                        {/* Controles de Paginación */}
                        {paginatedClients.totalPages > 1 && (
                            <div className="pagination-controls" style={{ padding: '10px 0', textAlign: 'center' }}>
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    style={{ marginRight: '10px' }}
                                >
                                    Página Anterior
                                </button>
                                <span>Página {currentPage} de {paginatedClients.totalPages}</span>
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, paginatedClients.totalPages))}
                                    disabled={currentPage === paginatedClients.totalPages}
                                    style={{ marginLeft: '10px' }}
                                >
                                    Página Siguiente
                                </button>
                            </div>
                        )}
                    </>
                )}
            </section>
        </>
    );
}

export default ClientManagement;

