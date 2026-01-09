// Front-End/src/modules/GestionUsuarios/GestionUsuarios.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../api';
import '../../styles/global.css';

function GestionUsuarios() {
    const navigate = useNavigate();
    const { user, isLoading: authLoading } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        identification: '',
        email: '',
        password: '',
        role: 'user'
    });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: null, message: '' });
    const [showForm, setShowForm] = useState(false);

    // Verificar que el usuario sea admin
    useEffect(() => {
        if (user && user.role !== 'admin') {
            navigate('/home', { replace: true });
        }
    }, [user, navigate]);

    // Cargar lista de usuarios
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const response = await fetch(`${API_URL}/users`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setUsers(data.users);
                } else {
                    setMessage({ type: 'error', message: 'Error al cargar usuarios' });
                }
            } catch (error) {
                console.error('Error:', error);
                setMessage({ type: 'error', message: 'Error de conexión' });
            } finally {
                setLoading(false);
            }
        };

        if (user?.role === 'admin') {
            fetchUsers();
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: null, message: '' });

        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', message: data.message });
                setUsers([...users, data.user]);
                setFormData({ name: '', identification: '', email: '', password: '', role: 'user' });
                setShowForm(false);
                setTimeout(() => setMessage({ type: null, message: '' }), 3000);
            } else {
                setMessage({ type: 'error', message: data.message });
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage({ type: 'error', message: 'Error de conexión' });
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return <div style={{ padding: '20px' }}>Cargando...</div>;
    }

    if (user?.role !== 'admin') {
        return null;
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <h1>Gestión de Usuarios</h1>

            {message.message && (
                <div style={{
                    padding: '10px',
                    marginBottom: '20px',
                    backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
                    color: message.type === 'success' ? '#155724' : '#721c24',
                    borderRadius: '4px'
                }}>
                    {message.message}
                </div>
            )}

            <button
                onClick={() => setShowForm(!showForm)}
                style={{
                    padding: '10px 20px',
                    marginBottom: '20px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                {showForm ? 'Cancelar' : 'Crear Nuevo Usuario'}
            </button>

            {showForm && (
                <form onSubmit={handleSubmit} style={{
                    backgroundColor: '#f9f9f9',
                    padding: '20px',
                    borderRadius: '4px',
                    marginBottom: '20px',
                    border: '1px solid #ddd'
                }}>
                    <div style={{ marginBottom: '15px' }}>
                        <label>Nombre:</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label>Cédula:</label>
                        <input
                            type="text"
                            name="identification"
                            value={formData.identification}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label>Email:</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label>Contraseña:</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label>Rol:</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd' }}
                        >
                            <option value="user">Usuario</option>
                            <option value="empleado">Empleado</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1
                        }}
                    >
                        {loading ? 'Creando...' : 'Crear Usuario'}
                    </button>
                </form>
            )}

            <h2>Usuarios Registrados ({users.length})</h2>
            <div style={{ overflowX: 'auto' }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    marginTop: '20px'
                }}>
                    <thead style={{ backgroundColor: '#f0f0f0' }}>
                        <tr>
                            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Nombre</th>
                            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Cédula</th>
                            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Email</th>
                            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Rol</th>
                            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Fecha Creación</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>Cargando usuarios...</td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>No hay usuarios</td>
                            </tr>
                        ) : (
                            users.map(u => (
                                <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px' }}>{u.name}</td>
                                    <td style={{ padding: '10px' }}>{u.identification}</td>
                                    <td style={{ padding: '10px' }}>{u.email}</td>
                                    <td style={{ padding: '10px' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            backgroundColor: u.role === 'admin' ? '#dc3545' : u.role === 'empleado' ? '#ffc107' : '#6c757d',
                                            color: u.role === 'admin' ? 'white' : u.role === 'empleado' ? 'black' : 'white',
                                            fontSize: '12px'
                                        }}>
                                            {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default GestionUsuarios;
