/**
 * ============================================================
 * CONFIGURACIÓN DE API DINÁMICA
 * ============================================================
 */

// Detecta la IP o dominio actual del navegador
// Si no hay variable de entorno, construye la URL usando la misma IP del navegador
// Se alinea el puerto por defecto con el backend (8080)
export const API_URL = import.meta.env.VITE_API_URL || (() => {
    const hostname = window.location.hostname;
    return `http://${hostname}:8080/api`;
})();