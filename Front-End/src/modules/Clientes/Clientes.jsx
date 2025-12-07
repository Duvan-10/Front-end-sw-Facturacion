// Front-end/src/modules/Clients/Clients.jsx

import React, { useState } from 'react';

// Datos de prueba (MOCK DATA)
const MOCK_CLIENTS = [
    { id: 1, identification: '101234567', name: 'Almacenes El Éxito S.A.', phone: '3001234567', email: 'exito@example.com' },
    { id: 2, identification: '900987654', name: 'Inversiones XYZ SAS', phone: '3109876543', email: 'xyz@example.com' },
    { id: 3, identification: '500112233', name: 'Duvan Melo Aranda', phone: '3205551122', email: 'duvan@example.com' },
];

function Clients() {
    const [clients, setClients] = useState(MOCK_CLIENTS);

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h2>Gestión de Clientes</h2>
            <p>Lista de clientes registrados en el sistema. (Datos de prueba)</p>

            {/* Botón para añadir nuevo cliente (funcionalidad pendiente) */}
            <button 
                className="btn primary" 
                style={{ marginBottom: '20px', padding: '10px 20px', backgroundColor: '#00c853', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            >
                ➕ Nuevo Cliente
            </button>

            {/* Tabla de Clientes */}
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', backgroundColor: '#2c2c2c', borderRadius: '8px', overflow: 'hidden', color: 'white' }}>
                <thead>
                    <tr style={{ backgroundColor: '#1e1e1e' }}>
                        <th style={{ padding: '12px 15px' }}>ID</th>
                        <th style={{ padding: '12px 15px' }}>Identificación</th>
                        <th style={{ padding: '12px 15px' }}>Nombre/Razón Social</th>
                        <th style={{ padding: '12px 15px' }}>Teléfono</th>
                        <th style={{ padding: '12px 15px' }}>Email</th>
                        <th style={{ padding: '12px 15px' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {clients.map((client) => (
                        <tr key={client.id} style={{ borderBottom: '1px solid #3c3c3c' }}>
                            <td style={{ padding: '12px 15px' }}>{client.id}</td>
                            <td style={{ padding: '12px 15px' }}>{client.identification}</td>
                            <td style={{ padding: '12px 15px', fontWeight: 'bold' }}>{client.name}</td>
                            <td style={{ padding: '12px 15px' }}>{client.phone}</td>
                            <td style={{ padding: '12px 15px' }}>{client.email}</td>
                            <td style={{ padding: '12px 15px' }}>
                                <button style={{ marginRight: '10px', backgroundColor: '#3498db', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}>
                                    ✏️ Editar
                                </button>
                                <button style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}>
                                    🗑️ Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Clients;