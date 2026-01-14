import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../api';
import ClienteForm from '../forms/ClientForm.jsx';
import '../styles/Modules_clients_products_factures.css';


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
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const currentUser = (() => { try { return JSON.parse(sessionStorage.getItem('user')); } catch { return null; } })();
    const isAdmin = currentUser?.role === 'admin';

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

    const handleCreateNew = () => {
        setEditingId(null);
        setShowForm(true);
    };

    const handleEdit = (id) => {
        setEditingId(id);
        setShowForm(true);
    };

    const handleDelete = async (client) => {
        if (!isAdmin) return;
        const ok = window.confirm(`¿Eliminar cliente "${client.nombre_razon_social}"?`);
        if (!ok) return;
        const token = getAuthToken();
        try {
            const res = await fetch(`${apiBaseUrl}/${client.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) { throw new Error(data.message || 'Error al eliminar cliente'); }
            setRefreshKey(prev => prev + 1);
        } catch (err) {
            alert(err.message);
        }
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
    };

    const handleSaved = () => {
        setRefreshKey(prev => prev + 1);
        closeForm();
    };

    return (
        <div className="client-management">
            <h2>Gestión de Clientes</h2>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="actions">
                <button 
                    className="btn-primary" 
                    onClick={handleCreateNew}
                    disabled={loading}
                >
                    ➕ Registrar Nuevo Cliente
                </button>
                <input 
                    type="text" 
                    placeholder="Filtrar por Identificación o Nombre"
                    value={inputValue} 
                    onChange={handleSearchChange}
                    autoComplete="off"
                />
            </div>

            {loading && <p>Cargando...</p>}

            <table className="client-table" id="tablaClientes">
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
                    {clients.length > 0 ? (
                        clients.map((client) => (
                            <tr key={client.id}>
                                <td><span className="badge">{client.tipo_identificacion}</span></td> 
                                <td>{client.identificacion}</td> 
                                <td style={{ fontWeight: '600' }}>
                                    {client.nombre_razon_social}
                                </td> 
                                <td>{client.telefono || '---'}</td>
                                <td>{client.email || '---'}</td>
                                <td>
                                    <button className="editar btn-warning" onClick={() => handleEdit(client.id)} disabled={loading} title="Editar cliente">✏️ Editar</button>
                                    {isAdmin && (
                                        <button className="eliminar btn-danger" onClick={() => handleDelete(client)} disabled={loading} title="Eliminar cliente">🗑️ Eliminar</button>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                                No hay clientes registrados.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {showForm && (
                <div className="modal-overlay" role="dialog" aria-modal="true">
                    <div className="modal-body">
                        <button className="modal-close" onClick={closeForm}>✕</button>
                        <ClienteForm clientId={editingId} onSuccess={handleSaved} onCancel={closeForm} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default Clientes;