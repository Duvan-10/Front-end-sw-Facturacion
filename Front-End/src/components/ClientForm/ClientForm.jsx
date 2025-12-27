import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import "../styles1.css"


function ClienteForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const apiBaseUrl = import.meta.env.VITE_API_URL 
        ? `${import.meta.env.VITE_API_URL}/clientes` 
        : 'http://localhost:8080/api/clientes';

    const [formData, setFormData] = useState({
        tipo_identificacion: 'Cédula de Ciudadanía',
        identificacion: '',
        nombre_razon_social: '',
        email: '',
        telefono: '',
        direccion: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Obtener token desde sessionStorage
    const getAuthToken = () => sessionStorage.getItem('authToken');

    useEffect(() => {
        const token = getAuthToken();
        
        // Redirección inmediata si no hay token (Evita 404 al usar '/')
        if (!token) {
            navigate('/'); 
            return;
        }

        if (isEdit) {
            const fetchCliente = async () => {
                try {
                    const response = await fetch(`${apiBaseUrl}/${id}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    
                    if (response.status === 401 || response.status === 403) {
                        sessionStorage.removeItem('authToken');
                        navigate('/'); 
                        return;
                    }
                    
                    if (!response.ok) throw new Error("No se pudo cargar el cliente.");
                    const data = await response.json();
                    setFormData(data);
                } catch (err) {
                    setError(err.message);
                }
            };
            fetchCliente();
        }
    }, [id, isEdit, apiBaseUrl, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

   const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = getAuthToken();
    if (!token) {
        navigate('/');
        return;
    }

    // --- NUEVA LÓGICA: CAPTURA DE HORA LOCAL DE LA PC ---
    const ahora = new Date();
    const fechaLocalPC = ahora.getFullYear() + "-" +
        String(ahora.getMonth() + 1).padStart(2, '0') + "-" +
        String(ahora.getDate()).padStart(2, '0') + " " +
        String(ahora.getHours()).padStart(2, '0') + ":" +
        String(ahora.getMinutes()).padStart(2, '0') + ":" +
        String(ahora.getSeconds()).padStart(2, '0');

    // Si es un nuevo registro (POST), incluimos la fecha de la PC
    // Si es edición (PUT), usualmente no queremos sobreescribir la fecha de creación original
    const datosParaEnviar = isEdit 
        ? formData 
        : { ...formData, fecha_creacion: fechaLocalPC };

    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? `${apiBaseUrl}/${id}` : apiBaseUrl;

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            // Enviamos datosParaEnviar en lugar de formData
            body: JSON.stringify(datosParaEnviar) 
        });

        const result = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                sessionStorage.removeItem('authToken');
                navigate('/');
                return;
            }
            throw new Error(result.message || "Error en la operación");
        }

        alert("✅ Operación exitosa");
        if (window.opener) {
            window.opener.postMessage('listUpdated', '*');
            window.close();
        } else {
            navigate('/home/clientes'); 
        }

    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="app-form card">
            <h1 className="module-title">{isEdit ? 'Editar Cliente' : 'Registro de Nuevo Cliente'}</h1>
            {error && <p style={{ color: '#721c24', backgroundColor: '#f8d7da', padding: '10px', borderRadius: '4px' }}>⚠️ {error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="section-group">
                    <div className="field-col">
                        <label>Tipo de ID:</label>
                        <select name="tipo_identificacion" value={formData.tipo_identificacion} onChange={handleChange} required>
                            <option value="Cédula de Ciudadanía">Cédula de Ciudadanía</option>
                            <option value="NIT">NIT</option>
                            <option value="Cédula de Extranjería">Cédula de Extranjería</option>
                            <option value="Pasaporte">Pasaporte</option>
                        </select>
                    </div>
                    <div className="field-col">
                        <label>Número de Identificación:</label>
                        <input type="text" name="identificacion" value={formData.identificacion} onChange={handleChange} required />
                    </div>
                </div>
                <div className="section-group">
                    <div className="field-col full-width">
                        <label>Nombre / Razón Social:</label>
                        <input type="text" name="nombre_razon_social" value={formData.nombre_razon_social} onChange={handleChange} required />
                    </div>
                </div>
                <div className="section-group">
                    <div className="field-col">
                        <label>Email:</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} />
                    </div>
                    <div className="field-col">
                        <label>Teléfono:</label>
                        <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} />
                    </div>
                </div>
                <div className="section-group">
                    <div className="field-col full-width">
                        <label>Dirección:</label>
                        <textarea name="direccion" value={formData.direccion} onChange={handleChange} />
                    </div>
                </div>
                <div className="final-buttons-group">
                    <button type="button" onClick={() => isEdit ? navigate('/home/clientes') : window.close()} className="btn-secondary">Cancelar</button>
                    <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Guardando...' : 'Guardar Cliente'}</button>
                </div>
            </form>
        </div>
    );
}

export default ClienteForm;