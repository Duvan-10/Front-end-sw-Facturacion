import React, { useState, useEffect } from 'react';
import '../styles/InvoiceStatusModal.css';

const InvoiceStatusModal = ({ invoice, isOpen, onClose, onStatusChange }) => {
    const [selectedStatus, setSelectedStatus] = useState(invoice?.estado || 'Pendiente');
    const [isExpired, setIsExpired] = useState(false);
    const [daysExpired, setDaysExpired] = useState(0);

    useEffect(() => {
        setSelectedStatus(invoice?.estado || 'Pendiente');
        
        // Verificar si está vencida
        if (invoice?.fecha_vencimiento) {
            const today = new Date();
            const vencimiento = new Date(invoice.fecha_vencimiento);
            const diffTime = today - vencimiento;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            setIsExpired(diffTime > 0 && invoice.estado !== 'Pagada' && invoice.estado !== 'Anulada');
            setDaysExpired(Math.max(0, diffDays));
        }
    }, [invoice]);

    const statuses = [
        { value: 'Pagada', label: '🟢 Pagada', color: '#28a745' },
        { value: 'Pendiente', label: '🟡 Pendiente', color: '#ffc107' },
        { value: 'Anulada', label: '⚪ Anulada', color: '#6c757d' },
        { value: 'Parcial', label: '🔵 Parcial', color: '#0d6efd' }
    ];

    const handleStatusChange = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/facturas/${invoice.id}/estado`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ estado: selectedStatus })
            });

            if (response.ok) {
                alert('✅ Estado actualizado exitosamente');
                onStatusChange(selectedStatus);
                onClose();
            } else {
                const error = await response.json();
                alert('❌ Error: ' + (error.message || 'No se pudo actualizar el estado'));
            }
        } catch (error) {
            alert('❌ Error de conexión: ' + error.message);
        }
    };

    if (!isOpen || !invoice) return null;

    const fechaEmision = invoice.date ? new Date(invoice.date).toLocaleDateString('es-ES') : 'N/A';
    const fechaVencimiento = invoice.fecha_vencimiento ? new Date(invoice.fecha_vencimiento).toLocaleDateString('es-ES') : 'N/A';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Cambiar Estado de Factura</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    {/* SECCION: Información de Factura */}
                    <div className="invoice-section">
                        <h3 className="section-title">📄 Detalles de Factura</h3>
                        
                        <div className="invoice-info">
                            <div className="info-row">
                                <label>Factura:</label>
                                <span>{invoice.numero_factura}</span>
                            </div>
                            <div className="info-row">
                                <label>Cliente:</label>
                                <span>{invoice.cliente_nombre}</span>
                            </div>
                            <div className="info-row">
                                <label>Identificación:</label>
                                <span>{invoice.identificacion || 'N/A'}</span>
                            </div>
                            <div className="info-row">
                                <label>Fecha Emisión:</label>
                                <span>{fechaEmision}</span>
                            </div>
                            <div className="info-row">
                                <label>Fecha Vencimiento:</label>
                                <span>{fechaVencimiento}</span>
                            </div>
                            {isExpired && (
                                <div className="info-row expired-warning">
                                    <label>Estado:</label>
                                    <span>🔴 Vencida ({daysExpired} {daysExpired === 1 ? 'día' : 'días'})</span>
                                </div>
                            )}
                            <div className="info-row total">
                                <label>Total:</label>
                                <span>${Math.round(invoice.total || 0).toLocaleString('es-CO')}</span>
                            </div>
                        </div>

                        {/* Detalles de Productos */}
                        {invoice.detalles && invoice.detalles.length > 0 && (
                            <div className="invoice-details">
                                <h4 className="details-title">Productos:</h4>
                                <div className="details-list">
                                    {invoice.detalles.map((detalle, idx) => (
                                        <div key={idx} className="detail-item">
                                            <span>{detalle.producto_nombre}</span>
                                            <span className="qty">Qty: {detalle.cantidad}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* SECCION: Cambiar Estado */}
                    <div className="status-section">
                        <h3 className="section-title">✏️ Cambiar Estado</h3>
                        <div className="status-options">
                            {statuses.map((status) => (
                                <label key={status.value} className="status-option">
                                    <input
                                        type="radio"
                                        name="status"
                                        value={status.value}
                                        checked={selectedStatus === status.value}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                    />
                                    <span>{status.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                    <button className="btn btn-primary" onClick={handleStatusChange}>Actualizar Estado</button>
                </div>
            </div>
        </div>
    );
};

export default InvoiceStatusModal;
