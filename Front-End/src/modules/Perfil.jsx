// Front-End/src/modules/Perfil.jsx
// Módulo de Perfil de Usuario: actualizar datos, contraseña y foto.
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../api';
import '../styles/Perfil.css';

function Perfil() {
    const { user, token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const fileInputRef = useRef(null);

    // Estado para datos del perfil
    const [profileData, setProfileData] = useState({
        name: '',
        identification: '',
        email: '',
        profile_photo: null
    });

    // Estado para formulario de actualizar datos
    const [formData, setFormData] = useState({
        name: '',
        identification: '',
        email: ''
    });

    // Estado para formulario de cambiar contraseña
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Estados para controlar la visualización de secciones
    const [showUpdateForm, setShowUpdateForm] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    // Cargar datos del perfil al montar el componente
    useEffect(() => {
        loadProfile();
    }, []);

    // Cargar perfil del usuario
    const loadProfile = async () => {
        try {
            const response = await fetch(`${API_URL}/perfil/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                setProfileData({
                    name: data.user.name,
                    identification: data.user.identification,
                    email: data.user.email,
                    profile_photo: data.user.profile_photo
                });
                setFormData({
                    name: data.user.name,
                    identification: data.user.identification,
                    email: data.user.email
                });
            } else {
                showMessage('error', data.message || 'Error al cargar el perfil');
            }
        } catch (error) {
            console.error('Error al cargar perfil:', error);
            showMessage('error', 'Error de conexión con el servidor');
        }
    };

    // Mostrar mensaje temporal
    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    // Manejar cambios en formulario de datos
    const handleFormChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Manejar cambios en formulario de contraseña
    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value
        });
    };

    // Actualizar datos del perfil
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/perfil/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setProfileData({
                    ...profileData,
                    name: data.user.name,
                    identification: data.user.identification,
                    email: data.user.email
                });
                
                // Actualizar sessionStorage
                const storedUser = JSON.parse(sessionStorage.getItem('user'));
                storedUser.name = data.user.name;
                storedUser.identification = data.user.identification;
                storedUser.email = data.user.email;
                sessionStorage.setItem('user', JSON.stringify(storedUser));

                // Disparar evento personalizado para notificar cambios
                window.dispatchEvent(new Event('userUpdated'));

                showMessage('success', data.message);
                setShowUpdateForm(false);
            } else {
                showMessage('error', data.message || 'Error al actualizar el perfil');
            }
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            showMessage('error', 'Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };

    // Cambiar contraseña
    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showMessage('password-error', 'Las contraseñas no coinciden');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            showMessage('password-error', 'La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/perfil/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(passwordData)
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('password-success', data.message);
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                setShowPasswordForm(false);
            } else {
                showMessage('password-error', data.message || 'Error al cambiar la contraseña');
            }
        } catch (error) {
            console.error('Error al cambiar contraseña:', error);
            showMessage('password-error', 'Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };

    // Manejar click en área de foto
    const handlePhotoClick = () => {
        fileInputRef.current.click();
    };

    // Subir foto de perfil
    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validar tipo de archivo
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            showMessage('error', 'Solo se permiten imágenes (JPG, PNG, GIF)');
            return;
        }

        // Validar tamaño (5MB)
        if (file.size > 5 * 1024 * 1024) {
            showMessage('error', 'La imagen no debe superar los 5MB');
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('photo', file);

            const response = await fetch(`${API_URL}/perfil/upload-photo`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                setProfileData({
                    ...profileData,
                    profile_photo: data.user.profile_photo
                });
                
                // Actualizar sessionStorage
                const storedUser = JSON.parse(sessionStorage.getItem('user'));
                storedUser.profile_photo = data.user.profile_photo;
                sessionStorage.setItem('user', JSON.stringify(storedUser));

                // Disparar evento personalizado para notificar cambios
                window.dispatchEvent(new Event('userUpdated'));

                showMessage('success', data.message);
            } else {
                showMessage('error', data.message || 'Error al subir la foto');
            }
        } catch (error) {
            console.error('Error al subir foto:', error);
            showMessage('error', 'Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="perfil-container">
            <h1>Mi Perfil</h1>

            {/* SECCIÓN DE FOTO Y DATOS */}
            <div className="perfil-card">
                <h2>Información Personal</h2>

                {/* Mensajes de estado para datos personales */}
                {message.text && message.type !== 'password-error' && (
                    <div className={`perfil-message perfil-message-${message.type}`}>
                        {message.text}
                    </div>
                )}

                {/* Foto de perfil */}
                <div className="perfil-photo-section">
                    <div className="photo" onClick={handlePhotoClick} style={{ cursor: 'pointer' }}>
                        {profileData.profile_photo ? (
                            <img 
                                src={`http://${window.location.hostname}:8080${profileData.profile_photo}`}
                                alt="Foto de perfil"
                                className="photo-img"
                            />
                        ) : (
                            <div className="photo-placeholder">
                                <span>📷</span>
                                <span className="photo-text">Subir Foto</span>
                            </div>
                        )}
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        style={{ display: 'none' }}
                    />
                    <p className="photo-hint">Click en la foto para cambiarla</p>
                </div>

                {/* Información del usuario */}
                <div className="perfil-info">
                    <div className="info-row">
                        <strong>Identificación:</strong>
                        <span>{profileData.identification}</span>
                    </div>
                    <div className="info-row">
                        <strong>Nombre:</strong>
                        <span>{profileData.name}</span>
                    </div>
                    <div className="info-row">
                        <strong>Email:</strong>
                        <span>{profileData.email}</span>
                    </div>
                </div>

                {/* Botón para mostrar/ocultar formulario de actualización */}
                <button 
                    className="btn-update"
                    onClick={() => setShowUpdateForm(!showUpdateForm)}
                >
                    {showUpdateForm ? 'Cancelar' : 'Actualizar Datos'}
                </button>

                {/* Formulario de actualización de datos */}
                {showUpdateForm && (
                    <form onSubmit={handleUpdateProfile} className="perfil-form">
                        <div className="form-group">
                            <label htmlFor="name">Nombre:</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleFormChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="identification">Identificación:</label>
                            <input
                                type="text"
                                id="identification"
                                name="identification"
                                value={formData.identification}
                                onChange={handleFormChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email:</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleFormChange}
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="btn-submit"
                            disabled={loading}
                        >
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </form>
                )}
            </div>

            {/* SECCIÓN DE CAMBIO DE CONTRASEÑA */}
            <div className="perfil-card">
                <h2>Seguridad</h2>

                {/* Mensajes de estado para cambio de contraseña */}
                {message.text && message.type === 'password-error' && (
                    <div className={`perfil-message perfil-message-error`}>
                        {message.text}
                    </div>
                )}
                {message.text && message.type === 'password-success' && (
                    <div className={`perfil-message perfil-message-success`}>
                        {message.text}
                    </div>
                )}

                <button 
                    className="btn-password"
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                >
                    {showPasswordForm ? 'Cancelar' : 'Cambiar Contraseña'}
                </button>

                {/* Formulario de cambio de contraseña */}
                {showPasswordForm && (
                    <form onSubmit={handleChangePassword} className="perfil-form">
                        <div className="form-group">
                            <label htmlFor="currentPassword">Contraseña Actual:</label>
                            <input
                                type="password"
                                id="currentPassword"
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="newPassword">Nueva Contraseña:</label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                required
                                minLength="6"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirmar Nueva Contraseña:</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                required
                                minLength="6"
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="btn-submit"
                            disabled={loading}
                        >
                            {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default Perfil;
