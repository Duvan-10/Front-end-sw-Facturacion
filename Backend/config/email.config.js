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
import { Resend } from 'resend';

// Configuración del transportador de email
let transporter;
let resendClient;

const emailService = (process.env.EMAIL_SERVICE || '').toLowerCase();
const useResendApi = emailService === 'resend' && process.env.RESEND_API_KEY;

if (useResendApi) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
} else if (emailService === 'custom') {
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

const sendEmail = async (mailOptions) => {
    if (useResendApi && resendClient) {
        const toList = Array.isArray(mailOptions.to) ? mailOptions.to : [mailOptions.to];
        const payload = {
            from: mailOptions.from,
            to: toList,
            subject: mailOptions.subject,
            html: mailOptions.html
        };

        if (Array.isArray(mailOptions.attachments) && mailOptions.attachments.length > 0) {
            payload.attachments = mailOptions.attachments.map((attachment) => ({
                filename: attachment.filename,
                content: Buffer.isBuffer(attachment.content)
                    ? attachment.content.toString('base64')
                    : attachment.content,
                contentType: attachment.contentType
            }));
        }

        const { data, error } = await resendClient.emails.send(payload);
        if (error) {
            throw new Error(error.message || 'Resend error');
        }
        return { messageId: data?.id };
    }

    if (!transporter) {
        throw new Error('Email transporter not configured');
    }

    return transporter.sendMail(mailOptions);
};

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
        const info = await sendEmail(mailOptions);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error al enviar email de recuperación:', error.message);
        throw error;
    }
};

// ============================================================
// 2. FUNCIÓN PARA GENERAR FACTURA EN PDF Y ENVIAR POR EMAIL
// PROPÓSITO:
//  - Generar PDF profesional de factura usando Puppeteer
//  - Enviar email con PDF adjunto al cliente
//  - Incluir información completa de emisor, cliente y detalles
// ============================================================

/**
 * Genera plantilla HTML para PDF de factura
 * @param {Object} facturaData - Datos de la factura
 * @param {Object} emisorData - Datos del emisor
 * @returns {string} HTML de la factura
 */
const generateInvoiceHTML = (facturaData, emisorData) => {
    const formatCurrency = (val) => `$${Math.round(val || 0).toLocaleString('es-CO')}`;
    const formatDate = (date) => date ? new Date(date).toLocaleDateString('es-CO') : '';
    const displayDate = facturaData.fecha_emision || facturaData.fecha_creacion;
    const backendBaseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 8080}`;
    const frontendBaseUrl = process.env.FRONTEND_URL || backendBaseUrl;
    const rawLogo = emisorData?.logo_url
        || emisorData?.logo
        || emisorData?.logo_path
        || emisorData?.logoBase64
        || emisorData?.logo_base64
        || null;

    const resolveLogoUrl = (value) => {
        if (!value) return null;
        if (value.startsWith('data:')) return value;
        if (/^https?:\/\//i.test(value)) return value;
        if (/^[A-Za-z0-9+/=]+$/.test(value) && value.length > 200) {
            return `data:image/png;base64,${value}`;
        }
        const path = value.startsWith('/') ? value : `/${value}`;
        if (path.startsWith('/pictures')) {
            return `${backendBaseUrl}${path}`;
        }
        return `${frontendBaseUrl}${path}`;
    };

    const logoUrl = resolveLogoUrl(rawLogo);
    const logoHtml = logoUrl ? `<img class="logo" src="${logoUrl}" alt="Logo" />` : '';

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: Arial, sans-serif; font-size: 12px; padding: 40px; }
                .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
                .emisor-info { width: 60%; }
                .logo { width: 70px; height: 70px; object-fit: contain; margin-bottom: 8px; }
                .emisor-info h1 { font-size: 16px; margin-bottom: 5px; }
                .invoice-meta { width: 35%; text-align: right; }
                .invoice-meta h2 { font-size: 18px; color: #333; }
                .invoice-number { font-size: 14px; color: red; margin: 5px 0; }
                .client-box { background: #f9f9f9; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
                .client-box h3 { border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 10px; }
                .client-row { margin-bottom: 5px; }
                .client-row strong { display: inline-block; width: 120px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th { background: #333; color: white; padding: 8px; text-align: left; }
                td { border-bottom: 1px solid #eee; padding: 8px; }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .totals { float: right; width: 250px; }
                .totals-row { display: flex; justify-content: space-between; padding: 5px 0; }
                .totals-row.final { border-top: 2px solid #333; font-weight: bold; margin-top: 10px; padding-top: 10px; }
            </style>
        </head>
        <body>
            <!-- ENCABEZADO -->
            <div class="header">
                <div class="emisor-info">
                    ${logoHtml}
                    <h1>${emisorData?.nombre_razon_social || 'Empresa'}</h1>
                    <p><strong>NIT:</strong> ${emisorData?.nit || ''}</p>
                    <p>${emisorData?.direccion || ''}</p>
                    <p>${emisorData?.ciudad || ''}, ${emisorData?.pais || ''}</p>
                    <p><strong>Tel:</strong> ${emisorData?.telefono || ''}</p>
                </div>
                <div class="invoice-meta">
                    <h2>FACTURA DE VENTA</h2>
                    <p class="invoice-number">N° ${facturaData.numero_factura}</p>
                    <p>Fecha: ${formatDate(displayDate)}</p>
                </div>
            </div>

            <!-- DATOS DEL CLIENTE -->
            <div class="client-box">
                <h3>DATOS DEL CLIENTE</h3>
                <div class="client-row"><strong>NIT/CC:</strong> ${facturaData.cliente.identificacion}</div>
                <div class="client-row"><strong>Razón Social:</strong> ${facturaData.cliente.nombre_razon_social}</div>
                <div class="client-row"><strong>Teléfono:</strong> ${facturaData.cliente.telefono}</div>
                <div class="client-row"><strong>Dirección:</strong> ${facturaData.cliente.direccion}</div>
            </div>

            <!-- TABLA DE PRODUCTOS -->
            <table>
                <thead>
                    <tr>
                        <th class="text-center" style="width: 8%">Cant.</th>
                        <th style="width: 42%">Detalle</th>
                        <th class="text-right" style="width: 15%">V. Unit.</th>
                        <th class="text-center" style="width: 12%">Desc.%</th>
                        <th class="text-right" style="width: 23%">V. Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${facturaData.detalles.map(item => `
                        <tr>
                            <td class="text-center">${item.cant}</td>
                            <td>${item.detail}</td>
                            <td class="text-right">${formatCurrency(item.unit)}</td>
                            <td class="text-center">${item.descuento || 0}%</td>
                            <td class="text-right">${formatCurrency(item.total)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <!-- TOTALES -->
            <div class="totals">
                <div class="totals-row">
                    <span>Subtotal:</span>
                    <span>${formatCurrency(facturaData.subtotal)}</span>
                </div>
                <div class="totals-row">
                    <span>IVA (19%):</span>
                    <span>${formatCurrency(facturaData.iva)}</span>
                </div>
                <div class="totals-row final">
                    <span>Total:</span>
                    <span>${formatCurrency(facturaData.total)}</span>
                </div>
            </div>
        </body>
        </html>
    `;
};

/**
 * Función para enviar factura por email con PDF adjunto
 * @param {Object} facturaData - Datos de la factura
 * @param {Object} emisorData - Datos del emisor
 * @param {string} clientEmail - Email del cliente
 * @returns {Promise} Resultado del envío
 */
export const sendInvoiceEmail = async (facturaData, emisorData, clientEmail) => {
    try {
        // Importar puppeteer dinámicamente
        const puppeteer = (await import('puppeteer')).default;

        // Generar HTML del PDF
        const htmlContent = generateInvoiceHTML(facturaData, emisorData);

        // Generar PDF con Puppeteer
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
        });
        await browser.close();

        const pdfContent = Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer);

        const displayDate = facturaData.fecha_emision || facturaData.fecha_creacion;

        // Configurar email
        const mailOptions = {
            from: `"${emisorData?.nombre_razon_social || 'Sistema de Facturación'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
            to: clientEmail,
            subject: `Factura N° ${facturaData.numero_factura} - ${emisorData?.nombre_razon_social || 'PFEPS'}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                        .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #007bff; }
                        .header h1 { color: #007bff; margin: 0; }
                        .content { padding: 20px 0; }
                        .content p { color: #333; line-height: 1.6; margin: 10px 0; }
                        .details { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
                        .details p { margin: 5px 0; }
                        .footer { text-align: center; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>${emisorData?.nombre_razon_social || 'Sistema de Facturación'}</h1>
                        </div>
                        
                        <div class="content">
                            <p>Estimado/a <strong>${facturaData.cliente.nombre_razon_social}</strong>,</p>
                            <p>Adjunto encontrará la factura de venta correspondiente a su compra:</p>
                            
                            <div class="details">
                                <p><strong>Factura N°:</strong> ${facturaData.numero_factura}</p>
                                <p><strong>Fecha:</strong> ${displayDate ? new Date(displayDate).toLocaleDateString('es-CO') : ''}</p>
                                <p><strong>Total:</strong> $${Math.round(facturaData.total || 0).toLocaleString('es-CO')}</p>
                            </div>
                            
                            <p>Gracias por su confianza.</p>
                        </div>
                        
                        <div class="footer">
                            <p>Este es un correo automático, por favor no responda a este mensaje.</p>
                            <p>&copy; ${new Date().getFullYear()} ${emisorData?.nombre_razon_social || 'PFEPS'}</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            attachments: [
                {
                    filename: `Factura_${facturaData.numero_factura}.pdf`,
                    content: pdfContent,
                    contentType: 'application/pdf'
                }
            ]
        };

        const info = await sendEmail(mailOptions);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error al enviar factura por email:', error.message);
        throw error;
    }
};

export default transporter;
