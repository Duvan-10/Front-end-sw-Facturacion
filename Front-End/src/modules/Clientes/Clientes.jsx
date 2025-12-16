import React, { useState, useEffect } from 'react'; 
// Usaremos useEffect para que el filtro y el listener se apliquen automáticamente.

// =======================================================
// DATOS Y CONSTANTES (Redefinidos para simulación)
// =======================================================
const initialClientsData = [
    { id: 101, name: 'Técnicas Avanzadas S.A.', nit: '900.123.456-7', phone: '3105550001', email: 'contacto@tecnicas.com' },
    { id: 102, name: 'Distribuidora Global Ltda.', nit: '800.987.654-3', phone: '3115550002', email: 'info@global.com' },
    { id: 103, name: 'Innovación Digital E.U.', nit: '100.222.333-4', phone: '3125550003', email: 'soporte@digital.net' },
    { id: 104, name: 'Martínez López, Ana', nit: '111.456.789-0', phone: '3151234567', email: 'ana@martinez.com' },
];

// Función de simulación: obtendría datos de la API
const fetchClientsSimulated = () => {
    // NOTA: En una aplicación real, esta función haría un fetch()
    // Aquí usamos un clon de los datos iniciales para simular la "recarga"
    return [...initialClientsData]; 
};


// =======================================================
// COMPONENTE PRINCIPAL: CLIENTES
// =======================================================

function Clientes() {
    
    // 1. Estados principales
    const [allClients, setAllClients] = useState(initialClientsData); // Fuente de datos completa
    const [clients, setClients] = useState(initialClientsData); // Lista filtrada/actual
    
    // 🟢 ESTADO CLAVE PARA RECARGA: Se incrementa para forzar useEffects
    const [refreshKey, setRefreshKey] = useState(0);

    // Estado para la Búsqueda
    const [searchQuery, setSearchQuery] = useState(''); 

    // =======================================================
    // I. LÓGICA DE BÚSQUEDA Y FILTRADO (Dependiente de refreshKey)
    // =======================================================
    
    // Función para recargar la lista de la API (simulada)
    const loadClients = () => {
        // Simulando carga: En una app real, fetch aquí y usa setAllClients(fetchedData)
        const loadedData = fetchClientsSimulated(); 
        setAllClients(loadedData);
        // NOTA: No llamamos a setClients aquí, lo hace el useEffect de filtrado.
    };

    const getFilteredClients = () => {
        let filtered = allClients; 
        
        if (searchQuery) {
            const query = searchQuery.toLowerCase().trim();
            filtered = filtered.filter(client => 
                client.nit.toLowerCase().includes(query) ||
                client.name.toLowerCase().includes(query)
            );
        }
        
        setClients(filtered);
    };

    // 1. Aplicar el filtro cada vez que 'searchQuery' o 'allClients' cambian
    useEffect(() => {
        getFilteredClients();
    }, [searchQuery, allClients]); 
    
    // Handler para cambios en la búsqueda
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };


    // =======================================================
    // II. HANDLER DE COMUNICACIÓN ENTRE PESTAÑAS (NUEVO)
    // =======================================================
    
    // Este useEffect se monta una sola vez para escuchar los mensajes
    useEffect(() => {
        const handleMessage = (event) => {
            // Asegura que el mensaje proviene de una fuente de confianza si es posible
            // Usamos '*' en ClientForm, así que verificamos el contenido del mensaje
            if (event.data === 'listUpdated') {
                console.log("Mensaje recibido: listUpdated. Forzando recarga de lista...");
                
                // 1. En una aplicación real con API: loadClients();
                
                // 2. En esta simulación: Forzar recarga incrementando la clave (refreshKey)
                setRefreshKey(prev => prev + 1); 
            }
        };

        window.addEventListener('message', handleMessage);
        
        // Limpieza: importante para evitar memory leaks al desmontar el componente
        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, []); // Se ejecuta solo una vez al montar

    // 3. Forzar una recarga de los datos de origen (simulado) cuando cambia refreshKey
    useEffect(() => {
        // Cuando refreshKey cambia, simulamos ir a buscar los datos actualizados.
        loadClients(); 
    }, [refreshKey]); // Depende de refreshKey


    // =======================================================
    // III. HANDLERS DE NAVEGACIÓN
    // =======================================================
    
    const handleCreateNew = () => {
        window.open('/clientes/crear', '_blank'); 
    };

    const handleEdit = (client) => {
        window.open(`/clientes/editar/${client.id}`, '_blank'); 
    };
    
    const handleDelete = (clientId) => {
        // La lógica de eliminación DEBERÍA llamar a la API y luego forzar la recarga
        if (window.confirm("¿Estás seguro de que quieres eliminar este cliente?")) {
            // Simulación de eliminación local
            const updatedClients = allClients.filter(client => client.id !== clientId);
            setAllClients(updatedClients); // Actualiza la fuente de datos principal
            setRefreshKey(prev => prev + 1); // Forzar re-renderizado
            console.log(`Simulando: Cliente ${clientId} eliminado.`);
        }
    };

    // =======================================================
    // IV. RENDERIZADO
    // =======================================================

    return (
        <div className="main-content">
            {/* ... JSX sigue igual ... */}
            <h1 className="module-title">Gestión de Clientes</h1>

            {/* --- 1. Controles de Búsqueda y Botón de Registro --- */}
            <section className="controls-section card">
                
                {/* 🟢 BARRA DE BÚSQUEDA 🟢 */}
                <div className="search-bar">
                    <label htmlFor="search">Buscar Cliente (NIT/CC o Nombre/Razón Social):</label>
                    <input 
                        type="text" 
                        id="search"
                        className="search-input" 
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Buscar por NIT/CC o Nombre..."
                    />
                </div>
                
                <button 
                    className="btn btn-primary btn-register-client" 
                    onClick={handleCreateNew} 
                >
                    Registrar Nuevo Cliente
                </button>
            </section>
            
            <hr/>
            
            {/* --- 2. Listado de Clientes (Tabla) --- */}
            <section className="list-section">
                <h2>Listado de Clientes ({clients.length} encontrados)</h2>
                
                {clients.length === 0 ? (
                    <p>No hay clientes que coincidan con la búsqueda.</p>
                ) : (
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
                                            onClick={() => handleDelete(client.id)}
                                        >
                                            Eliminar
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