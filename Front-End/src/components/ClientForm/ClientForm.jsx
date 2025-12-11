import React, { useState } from 'react';

// Se usará la clase CSS 'client-form card' definida en tu ClientForm.css o Clientes.css

const ClientForm = ({ initialData, onCancel, onSubmit }) => {
    
    // Estado para manejar los datos del cliente
    const [clientData, setClientData] = useState(initialData || {
        nit: '',
        name: '',
        phone: '',
        address: '',
        email: '',
    });

    // Handler genérico para actualizar el estado del formulario
    const handleChange = (e) => {
        const { id, value } = e.target;
        setClientData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Generar un ID si es nuevo (simulación)
        const finalData = { 
            ...clientData,
            id: initialData?.id || `CLI-${Math.floor(Math.random() * 1000)}` 

};

const action = initialData ? 'editó' : 'registró';
        alert(`✅ Cliente "${finalData.name}" ${action} con éxito. (Datos enviados a la consola)`);
        onSubmit(finalData); 
    };

    return (
        <form className="client-form card" onSubmit={handleSubmit}>
            <h2 className="module-title" style={{ textAlign: 'center' }}>
                {initialData ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
            </h2>
            
            <div className="section-group client-data">
                
                {/* NIT/CC */}
                <div className="field-col">
                    <label htmlFor="nit">NIT/CC</label>
                    <input type="text" id="nit" placeholder="Identificación" value={clientData.nit} onChange={handleChange} required />
                </div>
                
                {/* Razón Social / Nombre */}
                <div className="field-col">
                    <label htmlFor="name">Razón Social / Nombre</label>
                    <input type="text" id="name" placeholder="Nombre completo" value={clientData.name} onChange={handleChange} required />
                </div>

                {/* Teléfono */}
                <div className="field-col">
                    <label htmlFor="phone">Teléfono</label>
                    <input type="text" id="phone" placeholder="Número contacto" value={clientData.phone} onChange={handleChange} />
                </div>
                
                {/* Dirección */}
                <div className="field-col">
                    <label htmlFor="address">Dirección</label>
                    <input type="text" id="address" placeholder="Dirección" value={clientData.address} onChange={handleChange} />
                </div>
                
                {/* Correo */}
                <div className="field-col">
                    <label htmlFor="email">Correo</label>
                    <input type="email" id="email" placeholder="Correo electrónico" value={clientData.email} onChange={handleChange} />
                </div>
            </div>

            {/* Botones de Acción */}
            <div className="final-buttons-group" style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '30px' }}>
                <button 
                    type="submit" 
                    className="btn btn-success" 
                    style={{ width: '200px' }}
                >
                    {initialData ? 'Guardar Cambios' : 'Registrar Cliente'}
                </button>
                <button 
                    type="button" 
                    className="btn btn-danger" 
                    onClick={onCancel} 
                    style={{ width: '200px' }}
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
};

export default ClientForm;