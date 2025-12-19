// src/utils/pdfGenerator.jsx
import html2pdf from 'html2pdf.js';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import InvoicePDF from '../components/InvoicePDF/InvoicePDF';

export const visualizarFactura = async (facturaData, emisorData) => {
    // 1. Renderizar el componente a HTML string
    const htmlContent = ReactDOMServer.renderToString(
        <InvoicePDF data={facturaData} emisor={emisorData} />
    );

    const element = document.createElement('div');
    element.innerHTML = htmlContent;

    const opt = {
        margin: [10, 5],
        filename: `Factura_${facturaData.numero_factura}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 3, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // 2. EJECUTAR LA DESCARGA (Esto evita el cambio de URL y el error 404)
    try {
        await html2pdf().set(opt).from(element).save();
    } catch (error) {
        console.error("Error al generar el PDF:", error);
    }
};