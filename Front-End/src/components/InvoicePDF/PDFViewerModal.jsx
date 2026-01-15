import React, { useState } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import InvoicePDF from '../InvoicePDF/InvoicePDF';
import '../../styles/PDFViewerModal.css';

const PDFViewerModal = ({ facturaData, emisorData, isOpen, onClose, onStatusChange }) => {
    if (!isOpen) return null;

    return (
        <div className="pdf-viewer-modal-overlay">
            <div className="pdf-viewer-modal-container">
                <div className="pdf-viewer-header">
                    <h2>Factura {facturaData.numero_factura}</h2>
                    <button className="close-pdf-btn" onClick={onClose}>✕</button>
                </div>
                <div className="pdf-viewer-content">
                    <PDFViewer style={{ width: '100%', height: '100%' }}>
                        <InvoicePDF data={facturaData} emisor={emisorData} onStatusChange={onStatusChange} />
                    </PDFViewer>
                </div>
            </div>
        </div>
    );
};

export default PDFViewerModal;
