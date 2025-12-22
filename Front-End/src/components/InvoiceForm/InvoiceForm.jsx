 import React from 'react';
 import { useNavigate } from 'react-router-dom';
 import { useInvoiceLogic } from './logica.js';
 import '../styles1.css';


    

    //------------Funcion Formulario-------------//
     const InvoiceForm = () =>{
     const navigate = useNavigate(); 

       //Declaracion N°FAC-FECHA y FECHA-------Declaracion DATOS CLIENTE
       const { numeroFactura, fechaEmision,    identificacion, seleccionarCliente, cliente, sugerencias } = useInvoiceLogic();

         return (

          //************FORMULARIO CREACION FACTURA ELECTRONICA********************//

            <form className="app-form card">

                 <h2 className="module-title"> Registrar Nueva Factura</h2>

               

                 {/********************SELECCION PAGO*******************************************/}
         
                 <div className="section-group header-fields"></div>
                
                
                 <div className="pago"></div>

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
            
            
                

                     {/*********************** N°FACTURA Y FECHA*****************************/}
       
                 <div className='Numero-Fecha'></div>
               
                  <div className="field-col">
                  <label>Número de Factura</label>
                 <input type="text" value={numeroFactura} readOnly />
                 </div>


                 <div className="field-col">
                 <label htmlFor="fecha-emision">Fecha</label>
                 <input type="date" value={fechaEmision} onChange={(e) => setFechaEmision(e.target.value)} />
                 </div>
        
           

                  {/******************** DATOS DEL CLIENTE*********************************** */}
            
                 <h2 className="section-title">2. Datos del Cliente</h2>

                 <div className="section-group client-data"></div>


                  <div className="field-col"></div>

                   <label>NIT/CC</label>

                   <input 
                  type="text" 
                  value={identificacion}
                  onChange={seleccionarCliente} // Importante: que sea onChange
                  list="clientes-sugerencias" 
                  placeholder="Escribe NIT o Nombre..."/>
  

                  <datalist id="clientes-sugerencias">
                   {sugerencias.map((c) => (<option key={c.id} value={c.identificacion}>{c.nombre}</option>))}
                  </datalist>
                  

                   <div className="field-col">
                   <label>Razón Social / Nombre</label>
                   <input type="text" value={cliente.nombre} readOnly />
                   </div>


                  <div className="field-col">
                  <label>Teléfono</label>
                  <input type="text" value={cliente.telefono} readOnly />
                  </div>


                   <div className="field-col">
                   <label>Correo</label>
                   <input type="text"value={cliente.correo} readOnly />
                   </div>


                   <div className="field-col">
                   <label>Dirección</label>
                   <input type="text"value={cliente.direccion} readOnly />
                   </div>


                 

                 {/*********************DETALLES DEL PRODUCTO*********************************** */}


                 <h2 className="section-title">3. Detalle de Productos</h2>

                    <div className="product-grid product-header"></div>
                    <span>Código</span>
                    <span>Cant.</span>
                    <span>Detalle</span>
                    <span>V.Unitario</span>
                    <span>V.Total</span>
                    <span></span>
                   

                        {productosFactura.map((prod, index) => (
                   <div className="product-grid product-row" key={index}>
                       {/* INPUT CÓDIGO CON AUTOCOMPLETADO */}
                       <input 
                       type="text" 
                       placeholder="Cód." 
                      list="lista-productos"
                       value={prod.codigo}
                       onChange={(e) => {seleccionarProducto(e.target.value, index); buscarProductos(e.target.value, index);}}/>
        
                      <input 
                      type="number" 
                      value={prod.cantidad} 
                      onChange={(e) => {
                       const nuevos = [...productosFactura];
                       nuevos[index].cantidad = e.target.value;
                       nuevos[index].vTotal = nuevos[index].vUnitario * e.target.value;
                       setProductosFactura(nuevos);}}/>

                       <input type="text" value={prod.detalle} readOnly placeholder="Detalle del producto" />
        
                      <input type="number" value={prod.vUnitario} readOnly />
        
                      <input type="text" disabled value={prod.vTotal.toFixed(2)} />

                      <button 
                       type="button" 
                       className="delete-product" 
                       onClick={() => eliminarFilaProducto(index)}>
                        🗑
                      </button>

                   </div>
                  ))}

{/* DATALIST COMPARTIDO */}
<datalist id="lista-productos">
    {sugerenciasProd.map((p) => (
        <option key={p.id} value={p.codigo_producto}>
            {p.nombre_producto} - ${p.precio_venta}
        </option>
    ))}
</datalist>

<button 
    type="button" 
    className="btn btn-primary btn-sm" 
    onClick={agregarFilaProducto}
>
    + Añadir Producto
</button>

                  {/*******************TOTALES************************/}

 
                 <h2 className="section-title">4. Totales</h2>

                 <div className="totals-section"></div>

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

             
                 {/***********BOTONES**------- CREAR-----CANCELAR----***********/}

                  <div className="final-buttons-group"></div>

                 <button type="submit" className="btn btn-success">Crear Factura</button>

                 <button type="button"className="btn btn-danger"onClick={() => navigate('/home/facturas')}>Cancelar</button>
                

            </form>
        );
    };

export default InvoiceForm;