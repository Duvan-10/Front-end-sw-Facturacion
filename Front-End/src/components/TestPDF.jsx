import React, { useState } from 'react';
import { visualizarFactura } from '../utils/pdfGenerator';

const TestPDF = () => {
    const [cargando, setCargando] = useState(false);

    const ejecutarPrueba = async () => {
        setCargando(true);
        try {
            // 1. Obtener Emisor (Tu empresa)
            const resEmisor = await fetch('http://localhost:8080/api/emisor');
            const emisor = await resEmisor.json();

            // 2. Obtener Factura 15 (La que me mostraste)
            const idFactura = 15; 
            const resFactura = await fetch(`http://localhost:8080/api/facturas/${idFactura}`);
            
            if (!resFactura.ok) throw new Error("No se encontró la factura 15");
            const facturaDB = await resFactura.json();

            // 3. MAPEO EXACTO según tu JSON
            const facturaMapeada = {
                numero_factura: facturaDB.numero_factura, // "FAC-0001"
                fecha_emision: facturaDB.fecha_emision,   // "2025-12-18..."
                cliente: {
                    nombre_razon_social: facturaDB.cliente.nombre_razon_social, // "Maria Lucero..."
                    identificacion: facturaDB.cliente.identificacion,
                    direccion: facturaDB.cliente.direccion
                },
                // Mapeamos los detalles usando tus nombres: code, detail, cant, unit, total
                detalles: facturaDB.detalles.map(d => ({
                    code: d.code,
                    detail: d.detail,
                    cant: d.cant,
                    unit: parseFloat(d.unit), // Convertimos de string "1000.00" a número
                    total: d.total
                })),
                // Calculamos los totales si no vienen en el JSON principal
                subtotal: facturaDB.detalles.reduce((acc, d) => acc + d.total, 0),
                iva: facturaDB.detalles.reduce((acc, d) => acc + d.total, 0) * 0.19, // Ejemplo IVA 19%
                total: facturaDB.detalles.reduce((acc, d) => acc + d.total, 0) * 1.19
            };

            console.log("Generando PDF para:", facturaMapeada.cliente.nombre_razon_social);

            // 4. Generar el PDF
            await visualizarFactura(facturaMapeada, emisor);

        } catch (error) {
            console.error("Error:", error);
            alert("Error al generar: " + error.message);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
            <h1 style={{ color: '#2c3e50' }}>Sistema de Facturación</h1>
            <p>Factura detectada: <strong>FAC-0001 (Maria Lucero Aranda)</strong></p>
            
            <button 
                onClick={ejecutarPrueba} 
                disabled={cargando}
                style={{ 
                    padding: '20px 40px', 
                    fontSize: '18px', 
                    cursor: cargando ? 'not-allowed' : 'pointer', 
                    backgroundColor: cargando ? '#bdc3c7' : '#27ae60', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '5px',
                    transition: '0.3s'
                }}
            >
                {cargando ? 'Procesando...' : '📄 DESCARGAR FACTURA #15'}
            </button>
        </div>
    );
};

export default TestPDF;