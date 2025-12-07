import React, { useState } from 'react';
import './Clientes.css'; 

function ClientManagement() {
  // 1. Estado para almacenar los datos del nuevo cliente del formulario
  const [formData, setFormData] = useState({
    nitCc: '',
    razonSocial: '',
    telefono: '',
    direccion: '',
    correo: '',
  });

  // 2. Estado para almacenar la lista de clientes registrados
  const [clients, setClients] = useState([
    // Datos de ejemplo para inicializar la tabla
    { id: 1, nitCc: '123456789', razonSocial: 'Cliente Ejemplo S.A.', telefono: '555-1234', direccion: 'Calle Ficticia 123', correo: 'ejemplo@correo.com' },
  ]);

  // Maneja el cambio en los inputs del formulario
  const handleChange = (e) => {
    const { id, value } = e.target;
    // Adaptamos los IDs del HTML original a las claves del estado
    let keyName = id;
    if (id === 'nombre') keyName = 'nitCc'; // Corregir IDs del HTML original
    if (id === 'nit-cc') keyName = 'razonSocial'; // Corregir IDs del HTML original
    if (id === 'Direccion') keyName = 'direccion'; // Corregir mayúsculas

    setFormData({ ...formData, [keyName]: value });
  };

  // Maneja el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();

    // Crear nuevo cliente
    const newClient = {
      id: clients.length + 1,
      nitCc: formData.nitCc,
      razonSocial: formData.razonSocial,
      telefono: formData.telefono,
      direccion: formData.direccion,
      correo: formData.correo,
    };

    // Agregar el nuevo cliente a la lista y limpiar el formulario
    setClients([...clients, newClient]);
    setFormData({ nitCc: '', razonSocial: '', telefono: '', direccion: '', correo: '' });

    alert(`Cliente ${newClient.razonSocial} registrado con éxito.`);
  };

  return (
    <>
      <header>Gestión de Clientes</header>

      {/* --- Formulario de registro --- */}
      <section className="form-section">
        <h2>Registrar nuevo cliente</h2>
        <form onSubmit={handleSubmit}>
          
          <label htmlFor="nombre">NIT/CC:</label>
          <input 
            type="text" 
            id="nombre" 
            value={formData.nitCc} 
            onChange={handleChange} 
            required 
          />

          <label htmlFor="nit-cc">Razón Social/Nombre:</label>
          <input 
            type="text" 
            id="nit-cc" 
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

          <label htmlFor="Direccion">Dirección</label>
          <input 
            type="text" 
            id="Direccion" 
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
              <th>NIT/CC</th>
              <th>Razón Social/Nombre</th>
              <th>Teléfono</th>
              <th>Correo</th>
              <th>Dirección</th>
            </tr>
          </thead>
          <tbody>
            {/* Iteración de clientes usando map() */}
            {clients.map((client) => (
              <tr key={client.id}>
                <td>{client.id}</td>
                <td>{client.nitCc}</td>
                <td>{client.razonSocial}</td>
                <td>{client.telefono}</td>
                <td>{client.correo}</td>
                <td>{client.direccion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* La etiqueta <script src="clientes.js"></script> ha sido reemplazada 
         por la lógica de React (useState y handleSubmit) */}
    </>
  );
}

export default ClientManagement;