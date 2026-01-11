import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../api';


function ClienteForm({ clientId = null, onSuccess, onCancel }) {
    const { id: idFromParams } = useParams();
    const navigate = useNavigate();
    const id = clientId ?? idFromParams;
    const isEdit = Boolean(id);

    const apiBaseUrl = `${API_URL}/clientes`;

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

    // Obtener token desde sessionStorage (consistente con AuthContext)
    const getAuthToken = () => sessionStorage.getItem('token');

    useEffect(() => {
        const token = getAuthToken();
        
        // Redirección inmediata si no hay token
        if (!token) {
            navigate('/login'); 
            return;
        }

        if (isEdit) {
            const fetchCliente = async () => {
                try {
                    const response = await fetch(`${apiBaseUrl}/${id}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    
                    if (response.status === 401 || response.status === 403) {
                        sessionStorage.removeItem('token');
                        navigate('/login'); 
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
        navigate('/login');
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
        if (onSuccess) {
            onSuccess();
        } else if (window.opener) {
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
        <div className="form-shell">
            <form className="form-card" onSubmit={handleSubmit}>
                <header className="form-header">
                    <h2>{isEdit ? 'Editar Cliente' : 'Registrar Cliente'}</h2>
                    <p className="form-subtitle">Completa los datos para gestionar clientes.</p>
                </header>

                {error && <div className="form-error">⚠️ {error}</div>}

                <div className="form-grid">
                    <label className="form-field">
                        <span>Tipo de ID</span>
                        <select name="tipo_identificacion" value={formData.tipo_identificacion} onChange={handleChange} required>
                            <option value="Cédula de Ciudadanía">Cédula de Ciudadanía</option>
                            <option value="NIT">NIT</option>
                            <option value="Cédula de Extranjería">Cédula de Extranjería</option>
                            <option value="Pasaporte">Pasaporte</option>
                        </select>
                    </label>
                    <label className="form-field">
                        <span>Número de Identificación</span>
                        <input type="text" name="identificacion" value={formData.identificacion} onChange={handleChange} required />
                    </label>
                </div>

                <label className="form-field">
                    <span>Nombre / Razón Social</span>
                    <input type="text" name="nombre_razon_social" value={formData.nombre_razon_social} onChange={handleChange} required />
                </label>

                <div className="form-grid">
                    <label className="form-field">
                        <span>Email</span>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} />
                    </label>
                    <label className="form-field">
                        <span>Teléfono</span>
                        <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} />
                    </label>
                </div>

                <label className="form-field">
                    <span>Dirección</span>
                    <textarea name="direccion" value={formData.direccion} onChange={handleChange} />
                </label>

                <div className="form-actions">
                    <button type="button" className="btn ghost" onClick={onCancel || (() => isEdit ? navigate('/home/clientes') : window.close())}>Cancelar</button>
                    <button type="submit" disabled={loading} className="btn primary">{loading ? 'Guardando...' : 'Guardar Cliente'}</button>
                </div>
            </form>
        </div>
    );
}

export default ClienteForm;