import { pdf } from '@react-pdf/renderer';
import InvoicePDF from '../components/InvoicePDF/InvoicePDF';

export const visualizarFactura = async (facturaData, emisorData) => {
    const blob = await pdf(<InvoicePDF data={facturaData} emisor={emisorData} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Factura_${facturaData.numero_factura}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
};