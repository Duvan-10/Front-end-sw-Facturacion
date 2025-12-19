import React, { useState } from 'react';
import { visualizarFactura } from '../utils/pdfGenerator';

const TestPDF = () => {
    const [cargando, setCargando] = useState(false);

    const ejecutarPrueba = async () => {
        setCargando(true);
        try {
            // 1. Obtener Emisor (Tu empresa - PFEP S.A.S)
            const resEmisor = await fetch('http://localhost:8080/api/emisor');
            const emisor = await resEmisor.json();

            // 2. Obtener Factura 15 (Datos desde tu DB)
            const idFactura = 15; 
            const resFactura = await fetch(`http://localhost:8080/api/facturas/${idFactura}`);
            
            if (!resFactura.ok) throw new Error("No se encontró la factura 15");
            const facturaDB = await resFactura.json();

            // 3. MAPEO PARA LA NUEVA ESTRUCTURA DEL PDF
            const facturaMapeada = {
                numero_factura: facturaDB.numero_factura,
                fecha_emision: facturaDB.fecha_emision,
                cliente: {
                    identificacion: facturaDB.cliente.identificacion,
                    nombre_razon_social: facturaDB.cliente.nombre_razon_social,
                    telefono: facturaDB.cliente.telefono, // Agregado para el nuevo diseño
                    direccion: facturaDB.cliente.direccion
                },
                // Mapeo de detalles (Cant, Detalle, V.Unit, V.Total)
                detalles: facturaDB.detalles.map(d => ({
                    cant: d.cant,
                    detail: d.detail,
                    unit: parseFloat(d.unit),
                    total: d.total
                })),
                // Cálculos de Totales
                subtotal: facturaDB.detalles.reduce((acc, d) => acc + d.total, 0),
                iva: facturaDB.detalles.reduce((acc, d) => acc + d.total, 0) * 0.19,
                total: facturaDB.detalles.reduce((acc, d) => acc + d.total, 0) * 1.19
            };

            console.log("Datos listos para enviar al PDF:", facturaMapeada);

            // 4. Generar el PDF con el componente actualizado
            await visualizarFactura(facturaMapeada, emisor);

        } catch (error) {
            console.error("Error detallado:", error);
            alert("Error al generar: " + error.message);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
            <h1 style={{ color: '#2c3e50' }}>Generador de Documentos</h1>
            <p>Estado del sistema: <strong>Conectado a MySQL</strong></p>
            
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
                    transition: '0.3s',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
            >
                {cargando ? 'Consultando Datos...' : '📄 GENERAR FACTURA #15'}
            </button>
        </div>
    );
};

export default TestPDF;