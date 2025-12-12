import React, { useState } from 'react'; 
// NOTA: Se eliminan 'useEffect' y 'fetch' ya que la carga de datos no es local.
// NOTA: No hay estilos locales importados.

// =======================================================
// DATOS Y CONSTANTES (Redefinidos para simulación)
// =======================================================
// Se elimina apiBaseUrl y ITEMS_PER_PAGE. Usamos datos de simulación.
const initialClientsData = [
    { id: 101, name: 'Técnicas Avanzadas S.A.', nit: '900.123.456-7', phone: '3105550001', email: 'contacto@tecnicas.com' },
    { id: 102, name: 'Distribuidora Global Ltda.', nit: '800.987.654-3', phone: '3115550002', email: 'info@global.com' },
    { id: 103, name: 'Innovación Digital E.U.', nit: '100.222.333-4', phone: '3125550003', email: 'soporte@digital.net' },
];

// =======================================================
// COMPONENTE PRINCIPAL: CLIENTES (Estructural/Mock Data)
// =======================================================

function Clientes() {
    
    // 1. Estado principal (Usando datos simulados, ya no hay 'loading' ni 'error')
    const [clients, setClients] = useState(initialClientsData); 

    // =======================================================
    // I. LÓGICA DE CARGA DE DATOS DESDE LA API (ELIMINADA)
    // =======================================================
    // Se elimina fetchClients, useEffect de carga y useEffect de listener.
    
    // =======================================================
    // II. HANDLERS DE NAVEGACIÓN (Se mantienen)
    // =======================================================
    
    const handleCreateNew = () => {
        // Asume que la aplicación maneja el routing (React Router)
        console.log("Navegando a: /clientes/crear");
        // window.open('/clientes/crear', '_blank'); // Se mantiene si se usa nueva pestaña
    };

    const handleEdit = (client) => {
        console.log(`Navegando a: /clientes/editar/${client.id}`);
        // window.open(`/clientes/editar/${client.id}`, '_blank'); // Se mantiene si se usa nueva pestaña
    };
    
    // Función de ejemplo para Eliminar (ya no hace llamada API)
    const handleDelete = (clientId) => {
        // Simulamos la eliminación de la lista local
        setClients(clients.filter(client => client.id !== clientId));
        console.log(`Simulando: Cliente ${clientId} eliminado localmente.`);
    };

    // =======================================================
    // III. RENDERIZADO
    // =======================================================

    // Nota: 'loading' y 'error' se han eliminado del JSX.
    // Usamos variables de simulación si clients está vacío
    const displayClients = clients.length > 0 ? clients : initialClientsData;


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
            
            {/* --- 2. Listado de Clientes (Tabla) --- */}
            <section className="list-section">
                <h2>Listado de Clientes</h2>
                
                {clients.length === 0 ? (
                    <p>No hay clientes registrados.</p>
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