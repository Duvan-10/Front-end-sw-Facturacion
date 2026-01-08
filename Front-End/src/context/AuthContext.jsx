/**
 * ============================================================
 * CONTEXTO DE AUTENTICACIÓN
 * Archivo: AuthContext.jsx
 * RESPONSABILIDAD:
 *  - Centralizar el estado de sesión (usuario, token) usando sessionStorage.
 *  - Exponer funciones de login, registro y logout al resto de la app.
 *  - Gestionar mensajes de estado para pantallas de Login y Registro.
 * ============================================================
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../api'; // Importamos la configuración local del Frontend

// 1. Definición del Contexto
const AuthContext = createContext(null);

// 2. Componente Proveedor (Provider)
export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();

    // Estado global de autenticación
    const [user, setUser] = useState(null);
    // Inicializamos leyendo sessionStorage para persistir sesión solo mientras la pestaña esté abierta
    const [token, setToken] = useState(sessionStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(false);

    // Mensaje de estado global (error / éxito / info)
    // Siempre se maneja como objeto: { type: 'error' | 'success' | null, message: string }
    const [statusMessage, setStatusMessage] = useState({ type: null, message: '' }); 


    // --- EFECTO: RECUPERACIÓN DE SESIÓN ---
    useEffect(() => {
        if (token) {
            try {
                const storedUser = JSON.parse(sessionStorage.getItem('user'));
                setUser(storedUser);
                // Podrías redirigir automáticamente a /home si existe sesión válida
                // navigate('/home', { replace: true });
            } catch (e) {
                handleLogout();
            }
        } else {
            setUser(null);
        }
    }, [token, navigate]);

    // --- FUNCIÓN DE LOGOUT ---
    // Limpia el almacenamiento de sesión y el estado global
    const handleLogout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setStatusMessage({ type: 'success', message: 'Sesión cerrada correctamente.' });
        navigate('/login', { replace: true });
    };

    // --- FUNCIÓN DE REGISTRO ---
    const handleRegister = async (userData) => {
        setIsLoading(true);
        setStatusMessage({ type: null, message: '' });

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                setStatusMessage({ type: 'error', message: data.message || 'Error en el registro.' });
                return false;
            }

            setStatusMessage({ type: 'success', message: data.message || 'Usuario registrado exitosamente.' });
            return true;

        } catch (error) {
            console.error('Error en el registro:', error);
            setStatusMessage({ type: 'error', message: 'Error de conexión con el servidor.' });
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // --- FUNCIÓN DE LOGIN ---
    const handleLogin = async ({ email, password }) => {
        setIsLoading(true);
        setStatusMessage({ type: null, message: '' });

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setStatusMessage({ type: 'error', message: data.message || 'Error en el inicio de sesión.' });
                return false;
            }

            const { token, user } = data;

            // Guardamos en sessionStorage para seguridad (se borra al cerrar navegador)
            sessionStorage.setItem('token', token);
            sessionStorage.setItem('user', JSON.stringify(user));
            setToken(token);
            setUser(user);
            setStatusMessage({ type: 'success', message: 'Inicio de sesión exitoso.' });

            return true;
            
        } catch (error) {
            console.error('Error en el inicio de sesión:', error);
            setStatusMessage({ type: 'error', message: 'Error de conexión con el servidor.' });
            return false;
        } finally {
            setIsLoading(false);
        }
    };


    const isAuthenticated = !!user;

    // 3. Objeto que se pasa a los componentes que usan el contexto
    const contextValue = {
        user,
        token,
        isAuthenticated,
        isLoading,
        statusMessage,
        setStatusMessage,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// 4. Hook para facilitar el uso del contexto
export const useAuth = () => {
    return useContext(AuthContext);
};