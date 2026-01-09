/**
 * ============================================================
 * SWITCH GLOBAL DE TEMA (CLARO / OSCURO)
 * Archivo: ThemeSwitch.jsx
 * RESPONSABILIDAD:
 *  - Mostrar un botón fijo en pantalla para cambiar el modo de color.
 *  - Leer y actualizar el estado de tema desde ThemeContext.
 * ============================================================
 */

import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react'; // Iconos para representar el modo
const ThemeSwitch = () => {
    // Obtenemos el estado actual del tema y la función para cambiarlo desde el ThemeContext
    const { isLightMode, toggleTheme } = useTheme(); 

    return (
        <div className="theme-switcher-global">
            <button 
                onClick={toggleTheme} // Función que cambia el estado global del tema
                className="theme-button"
                // Atributos de accesibilidad y ayuda
                aria-label={isLightMode ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
                title={isLightMode ? 'Click Para Cambiar a Modo Oscuro' : 'Click Para Cambiar a Modo Claro'}
            >
                {/* Funcion Desactivada: (Renderiza el icono de la Luna si está en Modo Claro (para cambiar a Oscuro)
                    y el icono del Sol si está en Modo Oscuro (para cambiar a Claro) 
                {isLightMode ? <Moon size={24} /> : <Sun size={24} />}---------Funcion*/}

                {/* 1. Si está en Modo CLARO (isLightMode es true) -> Muestra el SOL (Sun) 
                    2. Si está en Modo OSCURO (isLightMode es false) -> Muestra la LUNA (Moon) */}

                    
                {isLightMode ? <Sun size={24} /> : <Moon size={24} />} {/*Funcion Activa*/}
            </button>
        </div>
    );
};

export default ThemeSwitch;