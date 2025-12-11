import React, { useState, useEffect } from 'react'; 
// NOTA: Se elimina la importación de ClientForm ya que se renderizará en otra ruta
// import ClientForm from '../../components/ClientForm/ClientForm'; 

// =======================================================
// DATOS Y CONSTANTES
// =======================================================
// Eliminamos initialClients ya que ahora se cargan de la API
const apiBaseUrl = 'http://localhost:8080/api/clientes'; // 🚨 AJUSTA ESTA URL REAL
const ITEMS_PER_PAGE = 30; 

// =======================================================
// COMPONENTE PRINCIPAL: CLIENTES (Con API Integration)
// =======================================================

function Clientes() {
    // 1. Estados principales
    const [clients, setClients] = useState([]); // Inicializamos con lista vacía
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // ... (Lógica de filtrado/búsqueda/paginación) ...

    // =======================================================
    // I. LÓGICA DE CARGA DE DATOS DESDE LA API
    // =======================================================
    
    const fetchClients = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log(`Cargando clientes desde: ${apiBaseUrl}`);
            const response = await fetch(apiBaseUrl);
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: No se pudo obtener el listado de clientes.`);
            }
            
            const data = await response.json();
            setClients(data); // 🚨 Actualiza el estado con los datos de la API
            
        } catch (err) {
            console.error("Error fetching clients:", err);
            setError("No se pudo cargar el listado de clientes. Verifique el backend.");
            setClients([]);
        } finally {
            setLoading(false);
        }
    };
    
    // 1. Efecto: Cargar datos al montar el componente
    useEffect(() => {
        fetchClients();
    }, []); // El array vacío asegura que se ejecuta solo una vez al montar

    // =======================================================
    // II. LISTENER PARA RECIBIR LA SEÑAL DE ACTUALIZACIÓN
    // =======================================================
    useEffect(() => {
        
        const handleListUpdate = (event) => {
            // Se puede refinar la verificación del origen si es necesario, 
            // pero para pestañas separadas, event.data es clave.
            if (event.data === 'listUpdated') {
                console.log("📢 Señal de 'listUpdated' recibida. Recargando listado de clientes...");
                // Dispara la función de carga de datos para reflejar los cambios en la DB
                fetchClients(); 
            }
        };

        // Suscribirse al evento de mensaje global
        window.addEventListener('message', handleListUpdate);

        // Limpiar la suscripción al desmontar
        return () => {
            window.removeEventListener('message', handleListUpdate);
        };
        
    }, []); // No depende de 'clients' porque fetchClients maneja el estado internamente.

    // =======================================================
    // III. HANDLERS DE NAVEGACIÓN (Se mantienen igual)
    // =======================================================
    
    const handleCreateNew = () => {
        window.open('/clientes/crear', '_blank'); 
    };

    const handleEdit = (client) => {
        window.open(`/clientes/editar/${client.id}`, '_blank');
    };
    
    // =======================================================
    // IV. RENDERIZADO
    // =======================================================

    return (
        <div className="main-content">
            <h1 className="module-title">Gestión de Clientes</h1>

            {/* --- 1. Controles y Botón de Registro --- */}
            <section className="controls-section card">
                <button 
                    className="btn btn-primary btn-register-client" 
                    onClick={handleCreateNew} 
                >
                    Registrar Nuevo Cliente
                </button>
            </section>
            
            <hr/>
            
            {/* --- 3. Listado de Clientes (Tabla) --- */}
            <section className="list-section">
                <h2>Listado de Clientes</h2>
                
                {loading && <p>Cargando clientes...</p>}
                {error && <p className="error-message">Error: {error}</p>}
                
                {!loading && clients.length > 0 && (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Razón Social / Nombre</th>
                                <th>NIT/CC</th>
                                <th>Teléfono</th>
                                <th>Correo</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.map((client) => (
                                <tr key={client.id}>
                                    <td>{client.id}</td>
                                    <td>{client.name}</td>
                                    <td>{client.nit}</td>
                                    <td>{client.phone}</td>
                                    <td>{client.email}</td>
                                    <td className="actions-cell">
                                        <button 
                                            className="btn btn-sm btn-edit" 
                                            onClick={() => handleEdit(client)} 
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            className="btn btn-sm btn-danger" 
                                            // En un entorno real, esta acción también debería notificar la recarga
                                            onClick={() => alert(`Simulando: Eliminar ${client.id}`)}
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                
                {!loading && !error && clients.length === 0 && (
                    <p>No hay clientes registrados.</p>
                )}
            </section>
        </div>
    );
}

export default Clientes;