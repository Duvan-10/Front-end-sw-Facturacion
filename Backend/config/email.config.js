/**
 * ============================================================
 * CONFIGURACIÓN DE SERVICIO DE EMAIL
 * Archivo: Backend/config/email.config.js
 * PROPÓSITO:
 *  - Configurar el transportador de email con Nodemailer
 *  - Soportar múltiples servicios SMTP (Gmail, Brevo, etc.)
 *  - Enviar emails de recuperación de contraseña personalizados
 *  - Gestionar plantillas HTML profesionales para emails
 * ============================================================
 */

// Backend/config/email.config.js

import nodemailer from 'nodemailer';

// Configuración del transportador de email
let transporter;

if (process.env.EMAIL_SERVICE === 'custom') {
    // Configuración para SMTP personalizado (Brevo, Mailtrap, etc.)
    const port = parseInt(process.env.EMAIL_PORT) || 2525;
    transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: port,
        secure: port === 465, // true para puerto 465, false para otros
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        },
        tls: {
            rejectUnauthorized: false // Para desarrollo
        },
        // Aumentar timeouts para evitar errores de "Greeting never received"
        greetingTimeout: 20000, // Esperar hasta 20s por el saludo del servidor
        socketTimeout: 20000    // Esperar hasta 20s por actividad en el socket
    });
} else {
    // Configuración para servicios de email estándar (Gmail, Outlook, etc.)
    transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
}

// Función para enviar email de recuperación de contraseña
export const sendPasswordResetEmail = async (userEmail, userName, resetToken) => {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
        from: `"Sistema de Facturación PFEPS" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: 'Recuperación de Contraseña - PFEPS',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 20px auto;
                        background-color: #ffffff;
                        padding: 30px;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    .header {
                        text-align: center;
                        padding-bottom: 20px;
                        border-bottom: 2px solid #007bff;
                    }
                    .header h1 {
                        color: #007bff;
                        margin: 0;
                    }
                    .content {
                        padding: 20px 0;
                    }
                    .content p {
                        color: #333;
                        line-height: 1.6;
                        margin: 10px 0;
                    }
                    .button {
                        display: inline-block;
                        padding: 12px 30px;
                        margin: 20px 0;
                        background-color: #007bff;
                        color: #ffffff !important;
                        text-decoration: none;
                        border-radius: 5px;
                        font-weight: bold;
                    }
                    .button:hover {
                        background-color: #0056b3;
                    }
                    .link {
                        word-break: break-all;
                        color: #007bff;
                        font-size: 12px;
                    }
                    .footer {
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #ddd;
                        text-align: center;
                        color: #666;
                        font-size: 12px;
                    }
                    .warning {
                        background-color: #fff3cd;
                        border-left: 4px solid #ffc107;
                        padding: 10px;
                        margin: 15px 0;
                    }
                    .warning p {
                        margin: 5px 0;
                        color: #856404;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔐 PFEPS</h1>
                        <p style="margin: 5px 0; color: #666;">Sistema de Facturación Electrónica</p>
                    </div>
                    
                    <div class="content">
                        <p>Hola <strong>${userName}</strong>,</p>
                        
                        <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.</p>
                        
                        <p>Para crear una nueva contraseña, haz clic en el siguiente botón:</p>
                        
                        <center>
                            <a href="${resetLink}" class="button">Restablecer Contraseña</a>
                        </center>
                        
                        <p>O copia y pega este enlace en tu navegador:</p>
                        <p class="link">${resetLink}</p>
                        
                        <div class="warning">
                            <p><strong>⚠️ Importante:</strong></p>
                            <p>• Este enlace expirará en <strong>1 hora</strong></p>
                            <p>• Si no solicitaste este cambio, ignora este correo</p>
                            <p>• Tu contraseña actual seguirá siendo válida</p>
                        </div>
                        
                        <p>Si tienes algún problema, contacta con el administrador del sistema.</p>
                    </div>
                    
                    <div class="footer">
                        <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
                        <p>&copy; ${new Date().getFullYear()} PFEPS - Sistema de Facturación Electrónica</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error al enviar email de recuperación:', error.message);
        throw error;
    }
};

export default transporter;
