import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../api';
import '../styles/global.css';

function Clientes() {
    const navigate = useNavigate();
    
    // URL base de la API
    const apiBaseUrl = `${API_URL}/clientes`;
    
    // Lee el token de sessionStorage (consistente con AuthContext)
    const getAuthToken = () => {
        return sessionStorage.getItem('token'); 
    };

    // Estados principales
    const [allClients, setAllClients] = useState([]); 
    const [clients, setClients] = useState([]);      
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0); 
    const [inputValue, setInputValue] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // =======================================================
    // I. LÓGICA DE CARGA DE DATOS (fetch GET)
    // =======================================================

    const loadClients = async () => {
        const token = getAuthToken();
        
        // 🚨 MEJORA: Redirección automática si no hay token
        if (!token) {
            setError("Sesión no válida o expirada. Redirigiendo...");
            setLoading(false);
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(apiBaseUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.status === 401 || response.status === 403) {
                sessionStorage.removeItem('token'); // Limpiar token inválido
                throw new Error("Acceso denegado. Sesión expirada.");
            }
            if (!response.ok) throw new Error(`Error en el servidor: ${response.status}`);
            
            const result = await response.json();
            const clientArray = Array.isArray(result) ? result : []; 
            setAllClients(clientArray);
            
        } catch (err) {
            console.error("Error en API Clientes:", err);
            setError(err.message);
            if (err.message.includes("Acceso denegado")) {
                setTimeout(() => navigate('/login'), 2000);
            }
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        loadClients(); 
    }, [refreshKey]); 

    // Debounce para búsqueda
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setSearchQuery(inputValue);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [inputValue]);

    // II. LÓGICA DE FILTRADO LOCAL
    useEffect(() => {
        const filteredClients = allClients.filter(client => {
            const query = searchQuery.toLowerCase().trim();
            const nombreStr = (client.nombre_razon_social || "").toLowerCase();
            const idStr = (client.identificacion || "").toLowerCase();
            return nombreStr.includes(query) || idStr.includes(query);
        });
        setClients(filteredClients); 
    }, [allClients, searchQuery]);
    
    const handleSearchChange = (e) => {
        setInputValue(e.target.value); 
    };

    // Escuchar mensajes de actualización desde ventanas emergentes
    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data === 'listUpdated') { 
                setRefreshKey(prev => prev + 1); 
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []); 

    const handleCreateNew = () => window.open('/clientes/crear', '_blank');
    const handleEdit = (id) => window.open(`/clientes/editar/${id}`, '_blank');

    return (
        <div className="main-content">
            <h1 className="module-title">Gestión de Clientes</h1>

            <section className="controls-section card">
                <div className="search-bar">
                    <label htmlFor="search">Buscar Cliente (ID o Nombre):</label>
                    <input 
                        type="text" 
                        id="search"
                        className="search-input" 
                        value={inputValue} 
                        onChange={handleSearchChange}
                        placeholder="Escribe para buscar..."
                        autoComplete="off"
                    />
                </div>
                
                <button 
                    className="btn btn-primary" 
                    onClick={handleCreateNew} 
                    disabled={loading}
                >
                    Registrar Nuevo Cliente
                </button>
            </section>
            
            <section className="list-section">
                <h2>Listado de Clientes ({clients.length} encontrados)</h2>
                
                {loading && <p>Cargando datos del servidor...</p>}
                {error && (
                    <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '4px', marginBottom: '10px' }}>
                        ⚠️ {error}
                    </div>
                )}

                {!loading && !error && clients.length === 0 ? (
                    <p>No hay clientes registrados en la base de datos.</p>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Tipo ID</th>
                                <th>Identificación</th>
                                <th>Razón Social / Nombre</th>
                                <th>Teléfono</th>
                                <th>Correo</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.map((client) => (
                                <tr key={client.id}>
                                    <td><span className="badge">{client.tipo_identificacion}</span></td> 
                                    <td>{client.identificacion}</td> 
                                    <td style={{ fontWeight: '600' }}>
                                        {client.nombre_razon_social}
                                    </td> 
                                    <td>{client.telefono || '---'}</td>
                                    <td>{client.email || '---'}</td>
                                    <td>
                                        <button 
                                            className="btn btn-sm btn-edit" 
                                            onClick={() => handleEdit(client.id)} 
                                            disabled={loading}
                                        >
                                            Editar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
        </div>
    );
}

export default Clientes;