// Front-end/src/modules/Clientes/Clientes.jsx

import React, { useState, useEffect, useMemo } from 'react'; 
import axios from 'axios'; 
// 🚨 Importamos el archivo de layout local
import './Clientes.css'; 


const API_URL = 'http://localhost:3000/api/clientes'; 
const ITEMS_PER_PAGE = 30; 

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
    const [clients, setClients] = useState([]); 
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null); 
    
    // 🚨 NUEVOS ESTADOS PARA DISEÑO Y FILTRO
    const [editingClientId, setEditingClientId] = useState(null); 
    const [editingData, setEditingData] = useState({});
    const [showForm, setShowForm] = useState(false); 
    const [searchTerm, setSearchTerm] = useState(''); 
    const [currentPage, setCurrentPage] = useState(1); 

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
            
            fetchClients(); 
            setShowForm(false); 
            
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
            if (error.response?.status === 401 || error.response?.status === 403) {
                 message = "Sesión expirada o token inválido.";
            }

            alert(`Error al registrar cliente: ${message}`);
        }
    };

// =======================================================
// III. FUNCIONES DE EDICIÓN
// =======================================================

const handleEdit = (client) => {
    setEditingClientId(client.id);
    setEditingData({ 
        id: client.id,
        tipo_identificacion: client.tipo_identificacion,
        identificacion: client.identificacion,
        nombre_razon_social: client.nombre_razon_social,
        telefono: client.telefono,
        direccion: client.direccion,
        email: client.email
    });
};

const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingData(prev => ({ ...prev, [name]: value }));
};

const handleCancelEdit = () => {
    setEditingClientId(null);
    setEditingData({});
};

const handleUpdate = async () => {
    const clientId = editingData.id;
    
    if (!editingData.identificacion || !editingData.nombre_razon_social) {
        alert("La Identificación y la Razón Social no pueden estar vacías.");
        return;
    }

    try {
        const token = localStorage.getItem('token');
        
        await axios.put(`${API_URL}/${clientId}`, editingData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        alert('Cliente actualizado con éxito.');
        
        setEditingClientId(null); 
        setEditingData({});
        fetchClients();

    } catch (error) {
        console.error('Error al actualizar cliente:', error);
        
        const message = error.response?.data?.message || 'Error desconocido al actualizar.';
        alert(`Fallo en la actualización: ${message}`);
    }
};


    // =======================================================
    // IV. LÓGICA DE FILTRADO Y PAGINACIÓN (useMemo)
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
    // V. RENDERIZADO
    // =======================================================
    return (
        <div className="client-management-container"> {/* Contenedor principal para el layout */}
            <header>Gestión de Clientes</header>

            {/* --- CONTROLES Y BOTÓN DE REGISTRO --- */}
            {/* Usamos la clase controls-section para el layout FLEX, definido en Clientes.css */}
            <section className="controls-section"> 
                <div className="search-bar search-container"> {/* Usamos ambas clases para compatibilidad con layout */}
                    <label htmlFor="search">Buscar Cliente (ID o Nombre): </label>
                    <input 
                        type="text" 
                        id="search" 
                        placeholder="Escribe aquí para búsqueda rápida..."
                        value={searchTerm} 
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1); 
                        }}
                    />
                </div>
                
                {/* Botón para mostrar/ocultar el formulario */}
                <button 
                    // Usamos las clases de global.css (.btn) y modificamos el color con una clase de estado
                    className={`btn ${showForm ? 'btn-danger' : 'btn-success'}`} 
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'Cancelar Registro' : 'Registrar Nuevo Cliente'}
                </button>
            </section>

            {/* --- Formulario de registro (CONDICIONAL) --- */}
            {showForm && (
                <section className="form-section"> {/* Hereda padding de global.css */}
                    <h2>Registrar nuevo cliente</h2>
                    <form onSubmit={handleSubmit}> {/* Hereda layout GRID de global.css */}
                        
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
            <section className="list-section"> {/* Hereda padding de global.css */}
                <h2>Clientes registrados ({paginatedClients.totalClients} en total)</h2>
                
                {loading ? (
                    <div className="loading-message">Cargando lista desde la base de datos...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
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
                                    <th>Acciones</th> 
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedClients.currentClients.length === 0 ? (
                                    <tr><td colSpan="8" className="no-data-message">No se encontraron clientes.</td></tr>
                                ) : (
                                    paginatedClients.currentClients.map((client, index) => {
                                        const isEditing = client.id === editingClientId;
                                        
                                        return (
                                            <tr key={client.id}> 
                                                <td>{index + 1 + (currentPage - 1) * ITEMS_PER_PAGE}</td> {/* Index real de la lista paginada */}
                                                
                                                {/* Renderizado condicional: INPUT o TEXTO */}
                                                <td>
                                                    {isEditing ? (
                                                        // Opciones de Select en línea para no complicar el CSS
                                                        <select name="tipo_identificacion" value={editingData.tipo_identificacion} onChange={handleEditChange} className="inline-edit-select">
                                                            <option value="NIT">NIT</option>
                                                            <option value="CC">CC</option>
                                                        </select>
                                                    ) : (
                                                        client.tipo_identificacion
                                                    )}
                                                </td>
                                                <td>
                                                    {isEditing ? (
                                                        <input type="text" name="identificacion" value={editingData.identificacion} onChange={handleEditChange} required className="inline-edit-input" />
                                                    ) : (
                                                        client.identificacion
                                                    )}
                                                </td>
                                                <td>
                                                    {isEditing ? (
                                                        <input type="text" name="nombre_razon_social" value={editingData.nombre_razon_social} onChange={handleEditChange} required className="inline-edit-input" />
                                                    ) : (
                                                        client.nombre_razon_social
                                                    )}
                                                </td>
                                                <td>
                                                    {isEditing ? (
                                                        <input type="text" name="telefono" value={editingData.telefono} onChange={handleEditChange} className="inline-edit-input" />
                                                    ) : (
                                                        client.telefono
                                                    )}
                                                </td>
                                                <td>
                                                    {isEditing ? (
                                                        <input type="email" name="email" value={editingData.email} onChange={handleEditChange} required className="inline-edit-input" />
                                                    ) : (
                                                        client.email
                                                    )}
                                                </td>
                                                <td>
                                                    {isEditing ? (
                                                        <input type="text" name="direccion" value={editingData.direccion} onChange={handleEditChange} required className="inline-edit-input" />
                                                    ) : (
                                                        client.direccion
                                                    )}
                                                </td>

                                                {/* Columna de ACCIONES */}
                                                <td className="actions-cell">
                                                    {isEditing ? (
                                                        <>
                                                            <button onClick={handleUpdate} className="btn btn-edit btn-save-inline">Guardar</button>
                                                            <button onClick={handleCancelEdit} className="btn btn-danger btn-cancel-inline">Cancelar</button>
                                                        </>
                                                    ) : (
                                                        <button onClick={() => handleEdit(client)} className="btn btn-edit">Editar</button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                        
                        {/* Controles de Paginación */}
                        {paginatedClients.totalPages > 1 && (
                            <div className="pagination-controls">
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="btn btn-pagination"
                                >
                                    Página Anterior
                                </button>
                                <span className="pagination-info">Página {currentPage} de {paginatedClients.totalPages}</span>
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, paginatedClients.totalPages))}
                                    disabled={currentPage === paginatedClients.totalPages}
                                    className="btn btn-pagination"
                                >
                                    Página Siguiente
                                </button>
                            </div>
                        )}
                    </>
                )}
            </section>
        </div>
    );
}

export default ClientManagement;