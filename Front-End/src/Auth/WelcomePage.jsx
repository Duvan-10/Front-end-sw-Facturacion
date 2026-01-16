/**
 * ============================================================
 * PANTALLA DE BIENVENIDA / ONBOARDING INICIAL
 * Archivo: WelcomePage.jsx
 * RESPONSABILIDAD:
 *  - Presentar el sistema de facturación la primera vez que se abre.
 *  - Guiar al usuario a crear el primer administrador mediante el botón "Registrarse".
 * ============================================================
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoOnboarding from '../Pictures/Auth/logo-welcome.png';
import '../styles/WelcomePage.css';


function WelcomePage() {

    // 1. HOOK DE NAVEGACIÓN: Necesario para cambiar de ruta
    const navigate = useNavigate(); 
    
    // 2. LÓGICA DE REDIRECCIÓN: envía al usuario al formulario de registro
    const handleStartRegistration = () => {
        // Redirige al usuario a la ruta del formulario de registro del administrador
        navigate('/register'); 
    };



    return (
        <div className="onboarding-container"> 
            
            {/* Logo exclusivo de la pantalla de bienvenida */}
            <img 
                src={logoOnboarding} 
                alt="Logo de Bienvenida" 
                className="onboarding-logo" 
            />
            
            <h2 className="onboarding-title">
                Bienvenido al Sistema de Facturación Electrónica.
            </h2>
            
            <p className="onboarding-text">
                Para empezar, por favor haz clic en "Registrarse".
                <br />
                El usuario que crearás será el administrador inicial que podrá registrar futuros usuarios.
            </p>

            {/* BOTÓN DE REGISTRO: redirige al formulario del primer administrador */}
            <div className="form-actions">
                <button 
                    type="button" 
                    className="onboarding-button-register" 
                    onClick={handleStartRegistration}
                >
                    Registrarse
                </button>
            </div>

        </div>
    );
}

export default WelcomePage;