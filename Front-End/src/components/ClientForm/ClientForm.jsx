// Front-end/src/modules/Clientes/Clientes.jsx
import React, { useState, useEffect } from 'react';

function Clientes() {
    const apiBaseUrl = import.meta.env.VITE_API_URL 
        ? `${import.meta.env.VITE_API_URL}/clientes` 
        : 'http://localhost:8080/api/clientes';

    const getAuthToken = () => localStorage.getItem('authToken');

    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Lógica de Debounce para la búsqueda
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    const loadClientes = async () => {
        const token = getAuthToken();
        if (!token) {
            setError("Sesión no válida.");
            setLoading(false);
            return;
        }

        if (clientes.length === 0) setLoading(true);

        try {
            const response = await fetch(`${apiBaseUrl}?search=${debouncedSearch}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error(`Error: ${response.status}`);

            const result = await response.json();
            setClientes(Array.isArray(result.data) ? result.data : []);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadClientes();
    }, [refreshKey, debouncedSearch]);

    // Escuchar mensajes de actualización desde la pestaña del formulario
    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data === 'listUpdated') setRefreshKey(prev => prev + 1);
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const handleCreateNew = () => window.open('/home/clientes/crear', '_blank');
    const handleEdit = (id) => window.open(`/home/clientes/editar/${id}`, '_blank');

    return (
        <div className="main-content">
            <h1 className="module-title">Gestión de Clientes</h1>

            <section className="controls-section card">
                <div className="search-bar">
                    <label htmlFor="search">Buscar Cliente:</label>
                    <input 
                        type="text" 
                        id="search"
                        className="search-input" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Nombre o Identificación..."
                        autoComplete="off"
                    />
                </div>
                <button className="btn btn-primary" onClick={handleCreateNew}>
                    Registrar Nuevo Cliente
                </button>
            </section>

            <section className="list-section">
                <h2>Listado de Clientes ({clientes.length})</h2>
                {loading && clientes.length === 0 && <p>Cargando...</p>}
                {error && <p style={{ color: 'red' }}>{error}</p>}

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Tipo</th>
                            <th>Identificación</th>
                            <th>Nombre / Razón Social</th>
                            <th>Email</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clientes.map((c) => (
                            <tr key={c.id}>
                                <td><span className="badge">{c.tipo_identificacion}</span></td>
                                <td>{c.identificacion}</td>
                                <td>{c.nombre}</td>
                                <td>{c.email}</td>
                                <td>
                                    <button className="btn btn-sm btn-edit" onClick={() => handleEdit(c.id)}>
                                        Editar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
}

export default Clientes;