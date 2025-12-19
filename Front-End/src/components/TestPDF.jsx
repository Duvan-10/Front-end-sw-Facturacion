import React, { useState } from 'react';
import { visualizarFactura } from '../utils/pdfGenerator';

const TestPDF = () => {
    const [cargando, setCargando] = useState(false);

    const ejecutarPrueba = async () => {
        setCargando(true);
        try {
            const response = await fetch('http://localhost:8080/api/emisor');
            const emisorReal = await response.json();
            
            // LOG PARA DEPURACIÓN
            console.log("DATOS PARA EL PDF:");
            console.table(emisorReal);

            const facturaEjemplo = {
                numero_factura: "PRO-001",
                fecha_emision: new Date().toISOString(),
                cliente: { nombre_razon_social: "CLIENTE TEST", identificacion: "000", direccion: "Calle 1" },
                detalles: [{ detail: "Prueba de sistema", total: 150000 }],
                total: 150000
            };

            await visualizarFactura(facturaEjemplo, emisorReal);
        } catch (error) {
            alert("Error: " + error.message);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <button 
                onClick={ejecutarPrueba} 
                disabled={cargando}
                style={{ padding: '20px', fontSize: '20px', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '10px' }}
            >
                {cargando ? 'Consultando...' : '📄 DESCARGAR PDF FINAL'}
            </button>
        </div>
    );
};

export default TestPDF;