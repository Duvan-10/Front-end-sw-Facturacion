import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useInvoiceLogic } from './logica.js';
import '../styles1.css';

//Funcion Formulario//
const InvoiceForm = () => {
    const navigate = useNavigate();
    const { numeroFactura, fechaEmision, setFechaEmision } = useInvoiceLogic();

    return (

//************FORMULARIO CREACION FACTURA ELECTRONICA**********************************************//

        <form className="app-form card">

            <h2 className="module-title">
                Registrar Nueva Factura
            </h2>

 {/********************SELECCION PAGO*******************************************/}
         
          <div 
                     className="section-group header-fields">
                <div 
                            className="pago">
                             <label>PAGO:</label>


                             <label className="selected-Default">
                            <input type="radio" name="pagoEstado" /> Dfault
                             </label>

                             <label className="selected-si">
                            <input type="radio" name="pagoEstado" /> Si
                             </label>

                            <label className="selected-no">
                            <input type="radio" name="pagoEstado" /> No
                            </label>
             </div>
                

{/*********************** N°FACTURA Y FECHA********************************************/}


               
        <div       
               className="field-col">

              <label>Número de Factura</label>

                <input type="text" value={numeroFactura} readOnly />
        </div>


        <div className="field-col">

<                label htmlFor="fecha-emision">Fecha</label>
                    
             <input type="date" value={fechaEmision} onChange={(e) => setFechaEmision(e.target.value)} />
                
        </div>

            
    </div>

{/******************** DATOS DEL CLIENTE*********************************** */}

            <h2 className="section-title">2. Datos del Cliente</h2>

            <div className="section-group client-data">


                
                <div className="field-col">
                    <label>NIT/CC (Enter para buscar)</label>
                    <input type="text" placeholder="Identificación" />
                </div>
               
               
                <div className="field-col">
                    <label>Razón Social / Nombre</label>
                    <input type="text" placeholder="Nombre completo" readOnly />
                </div>

                <div className="field-col">
                <label>Correo</label>
                <input type="text" readOnly />
               </div>


                <div className="field-col">
                    <label>Teléfono</label>
                    <input type="text" readOnly />
                </div>

            <div className="field-col">
                    <label>Dirección</label>
                    <input type="text" readOnly />
                </div>
            </div>


{/*********************DETALLES DEL PRODUCTO*********************************** */}


            <h2 className="section-title">3. Detalle de Productos</h2>

            <div className="product-grid product-header">
                <span>Código</span>
                <span>Cant.</span>
                <span>Detalle</span>
                <span>V.Unitario</span>
                <span>V.Total</span>
                <span></span>
            </div>


            <div className="product-grid product-row">
                <input type="text" placeholder="Cód." />
                <input type="number" defaultValue="1" />
                <input type="text" readOnly />
                <input type="number" readOnly />
                <input type="text" disabled value="0.00" />
                <button type="button" className="delete-product">🗑</button>
            </div>

            <button type="button" className="btn btn-primary btn-sm">
                + Añadir Producto
            </button>

{/***************************TOTALES***********************************************************************/}


            <h2 className="section-title">4. Totales</h2>

            <div className="totals-section">
                <div className="total-line">
                    <label>Subtotal</label>
                    <span>$0.00</span>
                </div>

                <br /><br />

                <div className="total-line">
                    <label>IVA (19%)</label>
                    <span>$0.00</span>
                </div>

                <br /><br />

                <div className="total-line total-final">
                    <label>Total</label>
                    <span>$0.00</span>
                </div>
            </div>
{/***********************BOTONES**------- CREAR-----CANCELAR----***************************/}*

            <div className="final-buttons-group">

                <button type="submit" className="btn btn-success">
                    Crear Factura
                </button>


                <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => navigate('/home/facturas')}
                       >
                    Cancelar
                </button>
            </div>

        </form>
    );
};

export default InvoiceForm;
