import { StyleSheet } from '@react-pdf/renderer';

export const styles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10 },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginBottom: 20,
        borderBottom: 1,
        borderBottomColor: '#000',
        paddingBottom: 10
    },
    emisorInfo: { flexDirection: 'column', width: '60%' },
    // CLASE DEL LOGO
    logo: { 
        width: 60, 
        height: 60, 
        marginBottom: 5 
    },
    emisorName: { fontSize: 14, fontWeight: 'bold', marginBottom: 2 },
    invoiceMeta: { width: '35%', textAlign: 'right' },
    title: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    invoiceNumber: { fontSize: 12, color: 'red', marginTop: 5 },
    clientBox: { 
        backgroundColor: '#f9f9f9', 
        padding: 10, 
        marginBottom: 20, 
        borderRadius: 4 
    },
    sectionTitle: { fontWeight: 'bold', marginBottom: 5, borderBottom: 1, borderBottomColor: '#eee' },
    table: { display: 'table', width: 'auto', marginBottom: 20 },
    tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 5 },
    tableHeader: { backgroundColor: '#333' },
    totalSection: { marginTop: 10, alignItems: 'flex-end' },
    totalRow: { flexDirection: 'row', width: '150', justifyContent: 'space-between', paddingVertical: 2 }
});