import React from 'react';
import { Page, Text, View, Document, Image } from '@react-pdf/renderer';
import { styles } from './InvoiceStyles';

const InvoicePDF = ({ data, emisor }) => {
    const formatCurrency = (val) => `$${(val || 0).toLocaleString('es-CO')}`;
    
    // Ruta del logo en la carpeta public
    const logoUrl = emisor?.logo_url ? window.location.origin + emisor.logo_url : null;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View style={styles.emisorInfo}>
                        {emisor?.logo_url && <Image src={logoUrl} style={styles.logo} />}
                        
                        {/* Mapeo exacto de tu JSON */}
                        <Text style={styles.emisorName}>{emisor?.nombre_razon_social || 'PFEP S.A.S'}</Text>
                        <Text>NIT: {emisor?.nit || '109.832.999-7'}</Text>
                        <Text>{emisor?.direccion || 'Dirección no definida'}</Text>
                        <Text>{emisor?.ciudad || 'Floridablanca'}, {emisor?.pais || 'Colombia'}</Text>
                        <Text>Tel: {emisor?.telefono || 'Sin teléfono'}</Text>
                    </View>
                    
                    <View style={styles.invoiceMeta}>
                        <Text style={styles.title}>FACTURA DE VENTA</Text>
                        <Text style={{color: 'red'}}>N° {data.numero_factura}</Text>
                        <Text>Fecha: {new Date(data.fecha_emision).toLocaleDateString()}</Text>
                    </View>
                </View>

                {/* TABLA SIMPLIFICADA PARA PRUEBA */}
                <View style={styles.table}>
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <Text style={{ width: '70%', color: 'white', paddingLeft: 5 }}>Descripción</Text>
                        <Text style={{ width: '30%', color: 'white', textAlign: 'right', paddingRight: 5 }}>Total</Text>
                    </View>
                    {data.detalles.map((item, i) => (
                        <View key={i} style={styles.tableRow}>
                            <Text style={{ width: '70%', paddingLeft: 5 }}>{item.detail}</Text>
                            <Text style={{ width: '30%', textAlign: 'right', paddingRight: 5 }}>{formatCurrency(item.total)}</Text>
                        </View>
                    ))}
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontWeight: 'bold' }}>TOTAL: {formatCurrency(data.total)}</Text>
                </View>
            </Page>
        </Document>
    );
};

export default InvoicePDF;