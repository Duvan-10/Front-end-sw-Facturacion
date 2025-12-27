import React from 'react';
import { Page, Text, View, Document, Image } from '@react-pdf/renderer';
import { styles } from './InvoiceStyles';

const InvoicePDF = ({ data, emisor }) => {
    const formatCurrency = (val) => `$${(val || 0).toLocaleString('es-CO')}`;
    const logoUrl = emisor?.logo_url ? window.location.origin + emisor.logo_url : null;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* 1. ENCABEZADO: DATOS DEL EMISOR */}
                <View style={styles.header}>
                    <View style={styles.emisorInfo}>
                        {emisor?.logo_url && <Image src={logoUrl} style={styles.logo} />}
                        <Text style={styles.emisorName}>{emisor?.nombre_razon_social}</Text>
                        <Text>NIT: {emisor?.nit}</Text>
                        <Text>{emisor?.direccion}</Text>
                        <Text>{emisor?.ciudad}, {emisor?.pais}</Text>
                        <Text>Tel: {emisor?.telefono}</Text>
                    </View>
                    <View style={styles.invoiceMeta}>
                        <Text style={styles.title}>FACTURA DE VENTA</Text>
                        <Text style={styles.invoiceNumber}>N° {data.numero_factura}</Text>
                        <Text>Fecha: {new Date(data.fecha_emision).toLocaleDateString()}</Text>
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
                        <Text style={{ width: '10%', color: 'white', textAlign: 'center' }}>Cant.</Text>
                        <Text style={{ width: '50%', color: 'white', paddingLeft: 5 }}>Detalle</Text>
                        <Text style={{ width: '20%', color: 'white', textAlign: 'right' }}>V. Unitario</Text>
                        <Text style={{ width: '20%', color: 'white', textAlign: 'right', paddingRight: 5 }}>V. Total</Text>
                    </View>

                    {data.detalles.map((item, i) => (
                        <View key={i} style={styles.tableRow}>
                            <Text style={{ width: '10%', textAlign: 'center' }}>{item.cant}</Text>
                            <Text style={{ width: '50%', paddingLeft: 5 }}>{item.detail}</Text>
                            <Text style={{ width: '20%', textAlign: 'right' }}>{formatCurrency(item.unit)}</Text>
                            <Text style={{ width: '20%', textAlign: 'right', paddingRight: 5 }}>{formatCurrency(item.total)}</Text>
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
};

export default InvoicePDF;