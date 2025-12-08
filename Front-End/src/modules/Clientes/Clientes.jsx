// Front-end/src/modules/Clientes/Clientes.jsx (VERSIÓN ACTUALIZADA CON TIPO DE DOCUMENTO)

import React, { useState } from 'react';
import './Clientes.css'; 

function ClientManagement() {
  // 1. Estado para almacenar los datos del nuevo cliente del formulario
  const [formData, setFormData] = useState({
    tipoDocumento: '', // 🚨 NUEVO CAMPO AGREGADO
    identificacion: '', // Usaremos 'identificacion' para el NIT/CC
    razonSocial: '',
    telefono: '',
    direccion: '',
    correo: '',
  });

  // 2. Estado para almacenar la lista de clientes registrados
  const [clients, setClients] = useState([
    { id: 1, tipoDocumento: 'NIT', identificacion: '900123456-7', razonSocial: 'Cliente Ejemplo S.A.', telefono: '555-1234', direccion: 'Calle Ficticia 123', correo: 'ejemplo@correo.com' },
  ]);

  // Maneja el cambio en los inputs del formulario
  const handleChange = (e) => {
    const { id, value } = e.target;
    
    // 🚨 CORRECCIÓN y Mapeo: Los IDs del HTML deben coincidir con las claves del estado (formData)
    setFormData({ ...formData, [id]: value });
  };

  // Maneja el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();

    // 🚨 Validar que el tipo de documento haya sido seleccionado
    if (!formData.tipoDocumento) {
        alert("Por favor, selecciona un Tipo de Documento (NIT/CC).");
        return;
    }
    
    // Crear nuevo cliente
    const newClient = {
      id: clients.length + 1,
      tipoDocumento: formData.tipoDocumento, // Incluir tipo de documento
      identificacion: formData.identificacion,
      razonSocial: formData.razonSocial,
      telefono: formData.telefono,
      direccion: formData.direccion,
      correo: formData.correo,
    };

    // Agregar el nuevo cliente a la lista y limpiar el formulario
    setClients([...clients, newClient]);
    setFormData({ 
        tipoDocumento: '', 
        identificacion: '', 
        razonSocial: '', 
        telefono: '', 
        direccion: '', 
        correo: '' 
    });

    alert(`Cliente ${newClient.razonSocial} registrado con éxito.`);
  };

  return (
    <>
      <header>Gestión de Clientes</header>

      {/* --- Formulario de registro --- */}
      <section className="form-section">
        <h2>Registrar nuevo cliente</h2>
        <form onSubmit={handleSubmit}>
          
          {/* 🚨 NUEVO CAMPO: Tipo de Documento */}
          <label htmlFor="tipoDocumento">Tipo de Documento:</label>
          <select 
            id="tipoDocumento" 
            value={formData.tipoDocumento} 
            onChange={handleChange} 
            required
          >
            <option value="">Seleccione...</option>
            <option value="NIT">NIT</option>
            <option value="CC">Cédula de Ciudadanía (CC)</option>
            {/* Puedes añadir otros tipos aquí (CE, PASAPORTE, etc.) */}
          </select>

          <label htmlFor="identificacion">NIT/CC (Número):</label>
          <input 
            type="text" 
            id="identificacion" 
            value={formData.identificacion} 
            onChange={handleChange} 
            required 
          />

          <label htmlFor="razonSocial">Razón Social/Nombre:</label>
          <input 
            type="text" 
            id="razonSocial" 
            value={formData.razonSocial} 
            onChange={handleChange} 
            required 
          />

          <label htmlFor="telefono">Teléfono:</label>
          <input 
            type="text" 
            id="telefono" 
            value={formData.telefono} 
            onChange={handleChange} 
          />

          <label htmlFor="direccion">Dirección:</label>
          <input 
            type="text" 
            id="direccion" 
            value={formData.direccion} 
            onChange={handleChange} 
            required 
          />

          <label htmlFor="correo">Correo electrónico:</label>
          <input 
            type="email" 
            id="correo" 
            value={formData.correo} 
            onChange={handleChange} 
            required 
          />

          <button type="submit" className="btn">Registrar Cliente</button>
        </form>
      </section>

      {/* --- Listado de clientes --- */}
      <section className="list-section">
        <h2>Clientes registrados</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Tipo Doc.</th> {/* 🚨 NUEVA COLUMNA */}
              <th>Identificación</th>
              <th>Razón Social/Nombre</th>
              <th>Teléfono</th>
              <th>Correo</th>
              <th>Dirección</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id}>
                <td>{client.id}</td>
                <td>{client.tipoDocumento}</td> {/* 🚨 NUEVO DATO */}
                <td>{client.identificacion}</td>
                <td>{client.razonSocial}</td>
                <td>{client.telefono}</td>
                <td>{client.correo}</td>
                <td>{client.direccion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}

export default ClientManagement;