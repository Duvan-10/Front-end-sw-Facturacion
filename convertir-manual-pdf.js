/**
 * Script para convertir Manual_Usuario.html a PDF con portada profesional
 * Utiliza Puppeteer para generar el PDF
 */

import puppeteer from 'puppeteer';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Convierte una imagen a base64
 */
function imagenABase64(rutaImagen) {
    try {
        const imagenBuffer = readFileSync(rutaImagen);
        const extension = path.extname(rutaImagen).toLowerCase();
        let mimeType = 'image/png';
        
        if (extension === '.jpg' || extension === '.jpeg') {
            mimeType = 'image/jpeg';
        } else if (extension === '.gif') {
            mimeType = 'image/gif';
        } else if (extension === '.svg') {
            mimeType = 'image/svg+xml';
        }
        
        return `data:${mimeType};base64,${imagenBuffer.toString('base64')}`;
    } catch (error) {
        console.warn(`⚠️  No se pudo cargar la imagen: ${rutaImagen}`);
        return null;
    }
}

/**
 * Reemplaza las rutas de imágenes por base64 en el HTML
 */
function procesarImagenesHTML(html, baseDir) {
    return html.replace(/src="([^"]+)"/g, (match, rutaRelativa) => {
        // Ignorar imágenes que ya son base64 o URLs externas
        if (rutaRelativa.startsWith('data:') || rutaRelativa.startsWith('http')) {
            return match;
        }
        
        const rutaAbsoluta = path.join(baseDir, rutaRelativa);
        const base64 = imagenABase64(rutaAbsoluta);
        
        if (base64) {
            console.log(`✓ Imagen procesada: ${rutaRelativa}`);
            return `src="${base64}"`;
        }
        
        return match;
    });
}

/**
 * Extrae los encabezados H2 y H3 para construir el índice
 */
function extraerIndice(html) {
    const entradas = [];
    const regex = /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi;
    let match;
    let contador = 0;

    const htmlConIds = html.replace(regex, (m, nivelStr, attrs, contenido) => {
        const nivel = parseInt(nivelStr, 10);
        const textoRaw = contenido
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        if (!textoRaw) {
            return m;
        }

        const slug = textoRaw
            .toLowerCase()
            .replace(/[áàäâ]/g, 'a')
            .replace(/[éèëê]/g, 'e')
            .replace(/[íìïî]/g, 'i')
            .replace(/[óòöô]/g, 'o')
            .replace(/[úùüû]/g, 'u')
            .replace(/ñ/g, 'n')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        const id = `${slug || 'seccion'}-${++contador}`;
        entradas.push({ nivel, texto: textoRaw, id });

        if (/id\s*=\s*"/i.test(attrs)) {
            return `<h${nivelStr}${attrs}>${contenido}</h${nivelStr}>`;
        }

        return `<h${nivelStr}${attrs} id="${id}">${contenido}</h${nivelStr}>`;
    });

    return { entradas, htmlConIds };
}

async function convertirManualAPDF() {
    console.log('🚀 Iniciando conversión del Manual de Usuario a PDF...');
    
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        // Leer el contenido del manual HTML
        const manualPath = path.join(__dirname, 'Manual_Usuario.html');
        const manualHTML = readFileSync(manualPath, 'utf-8');
        
        // Crear portada profesional
        const portadaHTML = `
            <div class="portada">
                <div class="logo-container">
                    <div class="logo-icon">📊</div>
                </div>
                
                <h1>MANUAL DE USUARIO</h1>
                <div class="divider"></div>
                <h2>Sistema de Facturación Electrónica PFEPS</h2>
                
                <div class="info-box">
                    <p><strong>Versión:</strong> 1.1</p>
                    <p><strong>Fecha:</strong> Enero 2026</p>
                    <p><strong>Documento:</strong> Guía Completa de Usuario</p>
                </div>
                
                <div class="footer-portada">
                    <p>Sistema Integral de Gestión de Facturación</p>
                </div>
            </div>
        `;
        
        // Crear índice (tabla de contenido) con enlaces
        console.log('🧭 Generando índice...');
        const { entradas: indice, htmlConIds } = extraerIndice(manualHTML);
        const itemsIndice = indice.map((item) => {
            const clase = item.nivel === 2 ? 'indice-h2' : 'indice-h3';
            return `<li class="${clase}"><a href="#${item.id}">${item.texto}</a></li>`;
        }).join('');

        // Crear el contenido del manual adaptado para PDF
        console.log('🖼️  Procesando imágenes del manual...');
        let contenidoManualPDF = procesarImagenesHTML(htmlConIds, __dirname);
        
        contenidoManualPDF = contenidoManualPDF.replace(
            /<style>/,
            `<style>
                @page {
                    margin: 18mm 16mm;
                    size: A4;
                }

                /* Normalización para PDF */
                body {
                    background: #ffffff !important;
                }

                .container {
                    max-width: 100% !important;
                    box-shadow: none !important;
                }

                /* Estructura: ocultar menú lateral y fijaciones */
                .sidebar {
                    display: none !important;
                }

                .content {
                    display: block !important;
                }

                .main-content {
                    margin-left: 0 !important;
                    margin-top: 0 !important;
                    padding: 12px 8px !important;
                }

                header {
                    position: relative !important;
                    margin-top: 0 !important;
                    page-break-after: avoid;
                }

                .version-info {
                    page-break-after: avoid;
                }

                /* Orden y paginado */
                h1, h2, h3, h4, h5, h6 {
                    page-break-after: avoid;
                    orphans: 3;
                    widows: 3;
                }

                h2 {
                    page-break-before: always;
                }

                h2:first-of-type {
                    page-break-before: avoid;
                }

                .section {
                    page-break-inside: avoid;
                }

                p, li {
                    orphans: 3;
                    widows: 3;
                }

                pre, code {
                    page-break-inside: avoid;
                }

                img {
                    max-width: 100% !important;
                    height: auto !important;
                    page-break-inside: avoid;
                    display: block;
                    margin: 10px auto;
                }

                figure, table {
                    page-break-inside: avoid;
                }

                ul, ol {
                    page-break-inside: avoid;
                }
            `
        );
        
        console.log('📄 Generando PDF único con portada, índice y contenido...');

        const htmlFinal = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <style>
                @page { margin: 20mm; size: A4; }
                body { margin: 0; padding: 0; }
                .page-break { page-break-after: always; }
                .portada {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    color: white;
                    text-align: center;
                    padding: 50px 60px;
                    box-sizing: border-box;
                    position: relative;
                }
                .logo-container { margin-bottom: 30px; }
                .logo-icon { font-size: 96px; margin-bottom: 10px; text-shadow: 4px 4px 8px rgba(0,0,0,0.3); }
                .portada h1 { font-size: 48px; margin: 20px 0 10px; text-shadow: 3px 3px 6px rgba(0,0,0,0.4); font-weight: 700; letter-spacing: 1.5px; }
                .portada h2 { font-size: 30px; margin: 10px 0 20px; font-weight: 300; opacity: 0.95; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
                .divider { width: 180px; height: 3px; background: white; margin: 18px auto 22px; opacity: 0.85; border-radius: 2px; }
                .info-box { background: rgba(255, 255, 255, 0.15); padding: 22px 40px; border-radius: 14px; margin-top: 20px; border: 2px solid rgba(255, 255, 255, 0.3); }
                .info-box p { font-size: 18px; margin: 10px 0; font-weight: 300; }
                .info-box strong { font-weight: 600; }
                .footer-portada { margin-top: 40px; font-size: 16px; opacity: 0.9; }
                .toc {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    color: #333;
                    padding: 0 10mm;
                }
                .toc h1 { font-size: 28px; margin-bottom: 10px; color: #4c51bf; }
                .toc .subtitulo { font-size: 14px; color: #666; margin-bottom: 20px; }
                .toc ul { list-style: none; padding: 0; }
                .toc li { margin: 6px 0; }
                .toc a { color: #333; text-decoration: none; }
                .toc .indice-h2 { font-weight: 600; font-size: 15px; margin-top: 10px; }
                .toc .indice-h3 { margin-left: 18px; font-size: 13px; color: #555; }
                .toc .linea { height: 2px; background: #4c51bf; width: 120px; margin: 10px 0 20px; }
            </style>
        </head>
        <body>
            <div class="page-break">${portadaHTML}</div>
            <div class="toc page-break">
                <h1>Tabla de contenido</h1>
                <div class="linea"></div>
                <div class="subtitulo">Manual de Usuario - Sistema PFEPS</div>
                <ul>
                    ${itemsIndice}
                </ul>
            </div>
            ${contenidoManualPDF}
        </body>
        </html>
        `;

        const pageManual = await browser.newPage();
        await pageManual.setContent(htmlFinal, { waitUntil: 'networkidle0' });
        const pdfBytes = await pageManual.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                bottom: '20mm',
                left: '15mm',
                right: '15mm'
            },
            displayHeaderFooter: true,
            headerTemplate: '<div></div>',
            footerTemplate: `
                <div style="width: 100%; font-size: 10px; padding: 5px; text-align: center; color: #666;">
                    <span>Manual de Usuario - Sistema PFEPS</span>
                    <span style="float: right; margin-right: 20px;">Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
                </div>
            `
        });
        await pageManual.close();

        const fs = await import('fs');
        const outputPath = path.join(__dirname, 'Manual_Usuario_PFEPS.pdf');
        fs.writeFileSync(outputPath, pdfBytes);

        console.log('✅ ¡PDF generado exitosamente!');
        console.log(`📁 Ubicación: ${outputPath}`);
        
    } catch (error) {
        console.error('❌ Error al generar el PDF:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

// Ejecutar la conversión
convertirManualAPDF()
    .then(() => {
        console.log('\n🎉 Proceso completado exitosamente');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Error en el proceso:', error);
        process.exit(1);
    });
