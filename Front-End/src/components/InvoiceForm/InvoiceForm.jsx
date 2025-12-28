 import React from 'react';
 import { useNavigate } from 'react-router-dom';
 import { useInvoiceLogic } from './logica.js';
 import '../styles1.css';

 
  //------------Funcion Formulario-------------//
 const InvoiceForm = () => {
  const navigate = useNavigate(); 

  const { 
    pagoEstado, 
    setPagoEstado, 
    numeroFactura, 
    fechaEmision, 
    setFechaEmision,
    identificacion, 
    seleccionarCliente, 
    handleClienteChange, 
    cliente, 
    sugerencias,
    productosFactura, 
    handleInputChange, 
    agregarFilaProducto, 
    eliminarFilaProducto,
    buscarProductos, 
    sugerenciasProd, 
    subtotal, 
    iva, 
    totalGeneral,
    handleSubmit 
  } = useInvoiceLogic();

        
  
  return (

          //************FORMULARIO CREACION FACTURA ELECTRONICA********************//

            <form className="app-form card" onSubmit={handleSubmit}>

                 <h2 className="module-title"> Registrar Nueva Factura</h2>

 {/*********************** N°FACTURA Y FECHA*****************************/}
    
             <div className='Subtitulo'>
                
                <div className='Numero-Fecha'>
                
                 <label className='Numero'>
                 <input type="text" value={numeroFactura} readOnly /> Número de Factura</label>
                 
                 <label className='Fecha'>
                 <input type="date" value={fechaEmision} onChange={(e) => setFechaEmision(e.target.value)} /> Fecha</label>
                 
                 
                </div>
           

                {/******************** SELECCION PAGO CON LÓGICA *******************/}
                  

                <div className="pago">

                  <label>PAGO:</label>

                  <label className="selected-Default">

                  <input 
                  type="radio" 
                  name="pagoEstado" 
                  value="Default"
                  checked={pagoEstado === 'Default'}
                  onChange={(e) => setPagoEstado(e.target.value)}/> Default</label>


                 <label className="selected-si">
                 <input 
                 type="radio" 
                 name="pagoEstado" 
                 value="Si"
                 checked={pagoEstado === 'Si'}
                 onChange={(e) => setPagoEstado(e.target.value)}/> Si</label>

                 <label className="selected-no">
                 <input 
                 type="radio" 
                 name="pagoEstado" 
                 value="No"
                 checked={pagoEstado === 'No'}
                 onChange={(e) => setPagoEstado(e.target.value)}/> No</label>
                
                </div>
                
            </div>
                
                


                {/* ******************** DATOS DEL CLIENTE *********************************** */}

<h2 className="section-title">2. Datos del Cliente</h2>



<div className="section-group">


<div className="client-data input">

        <label>Tipo Doc.</label>

        <select 
            name="tipo_identificacion" 
            value={cliente.tipo_identificacion} 
            onChange={handleClienteChange}
            
            className="form-select">

    <option value="C.C.">C.C.</option>
            <option value="NIT">NIT</option>
            <option value="C.E.">C.E.</option>
        </select>
    </div>


<div className="client-data input">
    <label>NIT/CC</label>
    <input 
        type="text" 
        value={identificacion}
        onChange={seleccionarCliente} 
        list="clientes-sugerencias" 
        placeholder="Escribe NIT o Nombre..."
    />
    <datalist id="clientes-sugerencias">
        {sugerencias.map((c) => (
            <option 
                key={c.id} 
                value={c.identificacion} // CAMBIADO: Ahora el valor es la ID
            >
                {c.nombre_razon_social} {/* El nombre aparece como texto de ayuda */}
            </option>
        ))}
    </datalist>
</div>

    {/* CAMPOS EDITABLES */}
    <div className="client-data input">
        <label>Nombre - Razón Social</label>
        <input 
            name="nombre" 
            value={cliente.nombre} 
            onChange={handleClienteChange} 
        />
    </div>

    <div className="client-data input">
        <label>Correo</label>
        <input 
            name="correo" 
            value={cliente.correo} 
            onChange={handleClienteChange} 
        />
    </div>

    <div className="client-data input">
        <label>Teléfono</label>
        <input 
            name="telefono" 
            value={cliente.telefono} 
            onChange={handleClienteChange} 
        />
    </div>

    <div className="client-data input">
        <label>Dirección</label>
        <input 
            name="direccion" 
            value={cliente.direccion} 
            onChange={handleClienteChange} 
        />
    </div>
</div>
                 


{/********************* DETALLES DEL PRODUCTO *********************************** */}
 <h2 className="section-title">3. Detalle de Productos</h2>
{/* Encabezado de la cuadrícula */}
<div className="product-grid product-header">
    <span>Código</span>
    <span>Cant.</span>
    <span>Detalle</span>
    <span>V.Unitario</span>
    <span>V.Total</span>
    <span></span>
</div>

{productosFactura.map((prod, index) => (
    <div className="product-grid product-row" key={index}>
        {/* ... tus otros inputs (Código, Cant, Detalle, V.Unit) ... */}
        
        <input type="text" value={prod.codigo} />
        <input type="number" value={prod.cantidad} />
        <input type="text" value={prod.detalle}  />
        <input type="number" value={prod.vUnitario} readOnly />

        {/* Columna V.Total */}
        <span className="v-total">
            {prod.vTotal.toLocaleString('es-CO')}
        </span>

        {/* COLUMNA DE ACCIONES: Aquí van los botones juntos */}
        <div className="action-buttons">
            {/* Botón Añadir (siempre visible o solo en la última fila) */}
            {index === productosFactura.length - 1 && (
                <button 
                    type="button" 
                    className="btn btn-primary btn-add-inline"
                    onClick={agregarFilaProducto}
                    title="Añadir fila"
                >
                    +
                </button>
            )}

            {/* Botón Eliminar (visible si hay más de una fila) */}
            {index > 0 && (
                <button 
                    type="button" 
                    className="delete-product"
                    onClick={() => eliminarFilaProducto(index)}
                    title="Eliminar fila"
                >
                    ✕
                </button>
            )}
        </div>
    </div>
))}


{/* DATALIST: Debe estar FUERA del map y el ID debe ser 'lista-productos' */}
<datalist id="lista-productos">
    {sugerenciasProd.map((p) => (
        <option key={p.id} value={p.codigo}>
            {p.nombre} - ${p.precio}
        </option>
    ))}
</datalist>
                  

                      <div className='rayita'/>
                            
                      



                {/*******************TOTALES************************/}

 
                <h2 className="section-totales">4. Totales</h2>

                <div className="total-line">
                <label>Subtotal</label>
                <span>${subtotal ? subtotal.toFixed(2) : "0.00"}</span>
               </div>

               <div className="iva">
                <label>IVA</label>
               {/* Cambia totalIva por iva aquí abajo */}
               <span>${iva ? iva.toFixed(2) : "0.00"}</span> 
               </div>

               <div className="total-line total-final">
               <label>Total</label>
               {/* Cambia totalFinal por totalGeneral aquí abajo */}
               <span>${totalGeneral ? totalGeneral.toFixed(2) : "0.00"}</span></div>

             
      {/*********** BOTONES CREAR - CANCELAR ***********/}

       <div className="final-buttons-group">
        <button 
        type="submit" // El type="submit" ya activa el onSubmit del <form> automáticamente
        className="btn btn-success"
    >
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