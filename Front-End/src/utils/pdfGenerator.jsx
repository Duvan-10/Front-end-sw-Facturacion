import { pdf } from '@react-pdf/renderer';
import InvoicePDF from '../components/InvoicePDF/InvoicePDF';

export const visualizarFactura = async (facturaData, emisorData) => {
    try {
        // 1. Generamos el documento PDF como un Blob
        // Usamos los nombres correctos: facturaData y emisorData
        const doc = <InvoicePDF data={facturaData} emisor={emisorData} />;
        const blob = await pdf(doc).toBlob();

        // 2. Creamos una URL temporal para ese Blob
        const url = URL.createObjectURL(blob);

        // 3. Abrimos la URL en una pestaña nueva del navegador
        window.open(url, '_blank');

        // Opcional: Liberar memoria después de un tiempo
        // setTimeout(() => URL.revokeObjectURL(url), 10000);

    } catch (error) {
        console.error("Error al abrir el PDF:", error);
        throw error;
    }
};