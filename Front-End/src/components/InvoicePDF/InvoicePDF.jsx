import React from 'react';
import './InvoicePDF.css';

const InvoicePDF = ({ data, emisor }) => {
    if (!data) return null;

    const infoEmisor = emisor || {
        nombre_razon_social: "PFEP S.A.S",
        nit: "109.832.999-7",
        direccion: "Barrio Asdeflor Calle 123 # 45 - 67",
        telefono: "(+57) 3156259645",
        ciudad: "Floridablanca",
        pais: "Colombia",
        logo_url: "/logo-empresa.png" 
    };

    return (
        <div id="invoice-pdf-template" className="pdf-container">
            <header className="pdf-header">
                {/* SECCIÓN DEL LOGO Y DATOS */}
                <div className="header-left">
                    {infoEmisor.logo_url && (
                        <img 
                            src={infoEmisor.logo_url} 
                            alt="Logo Empresa" 
                            className="invoice-logo" 
                        />
                    )}
                    <div className="emisor-details">
                        <h2 className="emisor-name">{infoEmisor.nombre_razon_social}</h2>
                        <p><strong>NIT:</strong> {infoEmisor.nit}</p>
                        <p>{infoEmisor.direccion}</p>
                        <p>{infoEmisor.telefono}</p>
                        <p>{infoEmisor.ciudad}, {infoEmisor.pais}</p>
                    </div>
                </div>

                <div className="invoice-meta">
                    <h1>FACTURA DE VENTA</h1>
                    <div className="invoice-number">N° {data.numero_factura}</div>
                    <p className="info-text">Fecha: <strong>{data.fecha_emision}</strong></p>
                </div>
            </header>

            <section className="client-section">
                <div>
                    <div className="section-label">DATOS DEL CLIENTE</div>
                    <div className="info-text">
                        <strong>{data.cliente?.nombre_razon_social}</strong><br />
                        NIT/CC: {data.cliente?.identificacion}<br />
                        Email: {data.cliente?.email || 'N/A'}
                    </div>
                </div>
                <div className="text-right">
                    <div className="section-label">DIRECCIÓN DE COBRO</div>
                    <div className="info-text">
                        {data.cliente?.direccion}<br />
                        Tel: {data.cliente?.telefono}
                    </div>
                </div>
            </section>

            <table className="pdf-table">
                <thead>
                    <tr>
                        <th>Cód.</th>
                        <th>Descripción</th>
                        <th className="text-center">Cant.</th>
                        <th className="text-right">V. Unitario</th>
                        <th className="text-right">V. Total</th>
                    </tr>
                </thead>
                <tbody>
                    {(data.detalles || []).map((item, index) => (
                        <tr key={index}>
                            <td>{item.code}</td>
                            <td>{item.detail}</td>
                            <td className="text-center">{item.cant}</td>
                            <td className="text-right">${(Number(item.unit) || 0).toLocaleString('es-CO')}</td>
                            <td className="text-right">${(Number(item.total) || 0).toLocaleString('es-CO')}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <footer className="totals-container">
                <div className="totals-table">
                    <div className="total-row">
                        <span>SUBTOTAL</span>
                        <span>${(Number(data.subtotal) || 0).toLocaleString('es-CO')}</span>
                    </div>
                    <div className="total-row">
                        <span>IVA (19%)</span>
                        <span>${(Number(data.iva) || 0).toLocaleString('es-CO')}</span>
                    </div>
                    <div className="total-row grand-total">
                        <span>TOTAL A PAGAR</span>
                        <span>${(Number(data.total) || 0).toLocaleString('es-CO')}</span>
                    </div>
                </div>
            </footer>

            <div className="pdf-footer">
                <p>Generado por Sistema PFEP. Nit: {infoEmisor.nit}</p>
            </div>
        </div>
    );
};

export default InvoicePDF;