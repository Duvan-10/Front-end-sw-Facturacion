// Front-end/src/modules/Perfil/Perfil.jsx
import React from 'react';
import '../styles/Perfil.css' // Importamos los estilos

function Perfil() {
    return (
        <div className="perfil-container">
            <h1>👤 Perfil del Usuario</h1>
            <p>Aquí puedes gestionar tus datos, foto y seguridad de la cuenta.</p>
            
            {/* 1. SECCIÓN DE FOTO Y DATOS */}
            <div className="perfil-card">
                <h3>Información de Registro</h3>
                {/* 🚨 Área para la foto de perfil (PENDIENTE) */}
                <div className="perfil-foto">
                    [Foto]
                </div>
                
                <p><strong>Nombre:</strong> [Nombre del Usuario]</p>
                <p><strong>Email:</strong> [Email del Usuario]</p>
                <button className="btn-actualizar">
                    Actualizar Datos
                </button>
            </div>

            {/* 2. SECCIÓN DE CAMBIO DE CONTRASEÑA */}
            <div className="perfil-card">
                <h3>Cambiar Contraseña</h3>
                <form>
                    {/* Campos para contraseña actual, nueva y confirmación (PENDIENTE) */}
                    <p>Formulario para cambiar la clave...</p>
                    <button className="btn-cambiar">
                        Cambiar Contraseña
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Perfil;
