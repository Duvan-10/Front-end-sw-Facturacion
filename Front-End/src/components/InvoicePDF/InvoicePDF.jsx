/**
 * ============================================================
 * COMPONENTE PDF DE FACTURA
 * Archivo: Front-End/src/components/InvoicePDF/InvoicePDF.jsx
 * PROPÓSITO:
 *  - Renderizar factura en formato PDF usando @react-pdf/renderer
 *  - Mostrar datos del emisor (logo, NIT, dirección, etc.)
 *  - Mostrar datos del cliente y detalles de productos
 *  - Incluir información de descuentos por producto
 *  - Calcular y mostrar totales (subtotal, IVA, total)
 *  - Permitir cambio de estado y impresión si showControls es true
 * ============================================================
 */

import React, { useState } from 'react';
import { Page, Text, View, Document, Image } from '@react-pdf/renderer';
import { styles } from './InvoiceStyles';
import { API_URL } from '../../api';

const InvoicePDF = ({ data, emisor, onStatusChange, showControls = false }) => {
    const [selectedStatus, setSelectedStatus] = useState(data.estado || 'Pendiente');
    const formatCurrency = (val) => `$${Math.round(val || 0).toLocaleString('es-CO')}`;
    const apiBaseUrl = API_URL.replace(/\/api\/?$/, '');
    const frontendBaseUrl = window.location.origin;
    const rawLogo = emisor?.logo_url
        || emisor?.logo
        || emisor?.logo_path
        || emisor?.logoBase64
        || emisor?.logo_base64
        || null;

    const resolveLogoUrl = (value) => {
        if (!value) return null;
        if (value.startsWith('data:')) return value;
        if (/^https?:\/\//i.test(value)) return value;
        if (/^[A-Za-z0-9+/=]+$/.test(value) && value.length > 200) {
            return `data:image/png;base64,${value}`;
        }
        let path = value.startsWith('/') ? value : `/${value}`;
        if (path.startsWith('/pictures')) {
            return `${apiBaseUrl}${path}`;
        }
        return `${frontendBaseUrl}${path}`;
    };

    const logoUrl = resolveLogoUrl(rawLogo);

    const handleStatusUpdate = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/facturas/${data.id}/estado`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                },
                body: JSON.stringify({ estado: selectedStatus })
            });

            if (response.ok) {
                alert('✅ Estado actualizado');
                if (onStatusChange) onStatusChange(selectedStatus);
            } else {
                alert('❌ Error al actualizar estado');
            }
        } catch (error) {
            alert('❌ Error: ' + error.message);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const PDFContent = (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* 1. ENCABEZADO: DATOS DEL EMISOR */}
                <View style={styles.header}>
                    <View style={styles.emisorInfo}>
                        {logoUrl && <Image src={logoUrl} style={styles.logo} />}
                        <Text style={styles.emisorName}>{emisor?.nombre_razon_social}</Text>
                        <Text>NIT: {emisor?.nit}</Text>
                        <Text>{emisor?.direccion}</Text>
                        <Text>{emisor?.ciudad}, {emisor?.pais}</Text>
                        <Text>Tel: {emisor?.telefono}</Text>
                    </View>
                    <View style={styles.invoiceMeta}>
                        <Text style={styles.title}>FACTURA DE VENTA</Text>
                        <Text style={styles.invoiceNumber}>N° {data.numero_factura}</Text>
                        <Text>Fecha: {new Date(data.fecha_emision || data.fecha_creacion).toLocaleDateString()}</Text>
                    </View>
                </View>

                {/* 2. DATOS DEL CLIENTE */}
                <View style={styles.clientBox}>
                    <Text style={styles.sectionTitle}>DATOS DEL CLIENTE</Text>
                    <View style={{ flexDirection: 'row', marginBottom: 2 }}>
                        <Text style={{ fontWeight: 'bold', width: '20%' }}>NIT/CC:</Text>
                        <Text>{data.cliente?.identificacion}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', marginBottom: 2 }}>
                        <Text style={{ fontWeight: 'bold', width: '20%' }}>Razón Social:</Text>
                        <Text>{data.cliente?.nombre_razon_social}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', marginBottom: 2 }}>
                        <Text style={{ fontWeight: 'bold', width: '20%' }}>Teléfono:</Text>
                        <Text>{data.cliente?.telefono}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={{ fontWeight: 'bold', width: '20%' }}>Dirección:</Text>
                        <Text>{data.cliente?.direccion}</Text>
                    </View>
                </View>

                {/* 3. DETALLE DE PRODUCTOS */}
                <View style={styles.table}>
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <Text style={{ width: '8%', color: 'white', textAlign: 'center' }}>Cant.</Text>
                        <Text style={{ width: '42%', color: 'white', paddingLeft: 5 }}>Detalle</Text>
                        <Text style={{ width: '15%', color: 'white', textAlign: 'right' }}>V. Unit.</Text>
                        <Text style={{ width: '12%', color: 'white', textAlign: 'center' }}>Desc.%</Text>
                        <Text style={{ width: '23%', color: 'white', textAlign: 'right', paddingRight: 5 }}>V. Total</Text>
                    </View>

                    {data.detalles.map((item, i) => (
                        <View key={i} style={styles.tableRow}>
                            <Text style={{ width: '8%', textAlign: 'center' }}>{item.cant}</Text>
                            <Text style={{ width: '42%', paddingLeft: 5 }}>{item.detail}</Text>
                            <Text style={{ width: '15%', textAlign: 'right' }}>{formatCurrency(item.unit)}</Text>
                            <Text style={{ width: '12%', textAlign: 'center' }}>{item.descuento || 0}%</Text>
                            <Text style={{ width: '23%', textAlign: 'right', paddingRight: 5 }}>{formatCurrency(item.total)}</Text>
                        </View>
                    ))}
                </View>

                {/* 4. TOTALES */}
                <View style={styles.totalSection}>
                    <View style={styles.totalRow}>
                        <Text>Subtotal</Text>
                        <Text>{formatCurrency(data.subtotal)}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text>IVA (19%)</Text>
                        <Text>{formatCurrency(data.iva)}</Text>
                    </View>
                    <View style={[styles.totalRow, { borderTopWidth: 1, marginTop: 5, paddingTop: 5 }]}>
                        <Text style={{ fontWeight: 'bold' }}>Total</Text>
                        <Text style={{ fontWeight: 'bold' }}>{formatCurrency(data.total)}</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );

    if (!showControls) {
        return PDFContent;
    }

    return (
        <>
            <div style={{ padding: '20px', backgroundColor: '#f5f5f5', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <label style={{ marginRight: '10px' }}>
                        <strong>Estado:</strong>
                        <select 
                            value={selectedStatus} 
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            style={{ marginLeft: '5px', padding: '5px', borderRadius: '4px' }}
                        >
                            <option value="Pagada">🟢 Pagada</option>
                            <option value="Pendiente">🟡 Pendiente</option>
                            <option value="Vencida">🔴 Vencida</option>
                            <option value="Anulada">⚪ Anulada</option>
                            <option value="Parcial">🔵 Parcial</option>
                        </select>
                    </label>
                    <button 
                        onClick={handleStatusUpdate}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Guardar Estado
                    </button>
                    <button 
                        onClick={handlePrint}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        🖨️ Imprimir
                    </button>
                </div>
            </div>
            {PDFContent}
        </>
    );
};

export default InvoicePDF;