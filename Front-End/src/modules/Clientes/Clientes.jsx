import React, { useState, useEffect } from 'react'; 

// =======================================================
// COMPONENTE PRINCIPAL: CLIENTES
// =======================================================

function Clientes() {
    
    // URL base de la API
    const apiBaseUrl = 'http://localhost:8080/api/clientes'; 
    
    const getAuthToken = () => {
        return sessionStorage.getItem('authToken'); 
    };

    // 1. Estados principales
    const [allClients, setAllClients] = useState([]); // Fuente original de la DB
    const [clients, setClients] = useState([]);      // Lista filtrada para mostrar
    
    // Estados de control
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0); 
    
    // Estados para búsqueda fluida (evita bloqueo de teclado)
    const [inputValue, setInputValue] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // =======================================================
    // I. LÓGICA DE CARGA DE DATOS (fetch GET)
    // =======================================================

    const loadClients = async () => {
        const token = getAuthToken();
        if (!token) {
            setError("Error de autenticación: Token no encontrado.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(apiBaseUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}` 
                }
            });
            
            if (response.status === 401) throw new Error("Acceso denegado. Sesión expirada.");
            if (!response.ok) throw new Error(`Error al cargar datos: ${response.status}`);
            
            const result = await response.json();
            
            // Si el backend devuelve { data: [...] } usamos result.data, si no, result directo
            const clientArray = Array.isArray(result) ? result : (result.data || []); 
            
            setAllClients(clientArray);
            
        } catch (err) {
            console.error("Error en API Clientes:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    // Ejecutar carga inicial y refrescos
    useEffect(() => {
        loadClients(); 
    }, [refreshKey]); 

    // --- Debounce: Actualiza searchQuery 300ms después de dejar de escribir ---
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setSearchQuery(inputValue);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [inputValue]);

    // --- II. LÓGICA DE FILTRADO LOCAL ---
    useEffect(() => {
        const filteredClients = allClients.filter(client => {
            const query = searchQuery.toLowerCase().trim();
            
            // 🚨 CORRECCIÓN: Usamos 'nombre_razon_social' que es el campo de tu DB
            const nombreStr = (client.nombre_razon_social || "").toLowerCase();
            const idStr = (client.identificacion || "").toLowerCase();
            
            return nombreStr.includes(query) || idStr.includes(query);
        });
        setClients(filteredClients); 
    }, [allClients, searchQuery]);
    
    const handleSearchChange = (e) => {
        setInputValue(e.target.value); // Cambio instantáneo en el input
    };

    // =======================================================
    // III. HANDLERS Y NAVEGACIÓN
    // =======================================================
    
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
    const handleEdit = (client) => window.open(`/clientes/editar/${client.id}`, '_blank');

    // =======================================================
    // IV. RENDERIZADO
    // =======================================================

    return (
        <div className="main-content">
            <h1 className="module-title">Gestión de Clientes</h1>

            <section className="controls-section card">
                <div className="search-bar">
                    <label htmlFor="search">Buscar Cliente (Identificación o Nombre):</label>
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
                    className="btn btn-primary btn-register-client" 
                    onClick={handleCreateNew} 
                    disabled={loading}
                >
                    Registrar Nuevo Cliente
                </button>
            </section>
            
            <hr/>
            
            <section className="list-section">
                <h2>Listado de Clientes ({clients.length} encontrados)</h2>
                
                {loading && <p>Cargando datos...</p>}
                {error && <p style={{ color: 'red' }}>Error: {error}</p>}

                {!loading && !error && clients.length === 0 ? (
                    <p>No se encontraron clientes.</p>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
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
                                    <td>{client.id}</td>
                                    <td>{client.tipo_identificacion}</td> 
                                    <td>{client.identificacion}</td> 
                                    
                                    {/* 🚨 COLUMNA CORREGIDA CON NOMBRE_RAZON_SOCIAL */}
                                    <td style={{ fontWeight: '600' }}>
                                        {client.nombre_razon_social || "---"}
                                    </td> 

                                    <td>{client.telefono || 'N/A'}</td>
                                    <td>{client.email || 'N/A'}</td>
                                    
                                    <td className="actions-cell">
                                        <button 
                                            className="btn btn-sm btn-edit" 
                                            onClick={() => handleEdit(client)} 
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