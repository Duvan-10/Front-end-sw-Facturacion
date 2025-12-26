 import React from 'react';
 import { useNavigate } from 'react-router-dom';
 import { useInvoiceLogic } from './logica.js';
 import '../styles1.css';


  //------------Funcion Formulario-------------//
 

  //Declaracion N°FAC-FECHA y FECHA-------Declaracion DATOS CLIENTE------Declaracion Productos-------Totales//
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



                {/******************** SELECCION PAGO CON LÓGICA *******************/}
                  <div className="section-group header-fields">
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
        
           

                {/* ******************** DATOS DEL CLIENTE *********************************** */}
<h2 className="section-title">2. Datos del Cliente</h2>

<div className="section-group client-data">
    {/* Cambia esta sección en tu JSX */}
<div className="field-col">
    <label>NIT/CC (Búsqueda)</label>
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
    <div className="field-col">
        <label>Nombre o Razón Social</label>
        <input 
            name="nombre" 
            value={cliente.nombre} 
            onChange={handleClienteChange} 
        />
    </div>

    <div className="field-col">
        <label>Correo</label>
        <input 
            name="correo" 
            value={cliente.correo} 
            onChange={handleClienteChange} 
        />
    </div>

    <div className="field-col">
        <label>Teléfono</label>
        <input 
            name="telefono" 
            value={cliente.telefono} 
            onChange={handleClienteChange} 
        />
    </div>

    <div className="field-col">
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

{/* Renderizado dinámico de filas */}
{productosFactura.map((prod, index) => (
    <div className="product-grid product-row" key={index}>
        
        {/* Código: EDITABLE y con Vínculo al Datalist */}
        <input 
            type="text" 
            value={prod.codigo} 
            list="lista-productos" // ESTA LÍNEA activa el autocompletado
            onChange={(e) => {
                handleInputChange(index, 'codigo', e.target.value);
                buscarProductos(e.target.value); // Busca en el backend mientras escribes
            }} 
            placeholder="Cód."
        />

        {/* Cantidad: EDITABLE */}
        <input 
            type="number" 
            value={prod.cantidad} 
            min="1"
            onChange={(e) => handleInputChange(index, 'cantidad', e.target.value)} 
        />

        {/* Detalle: EDITABLE */}
        <input 
            type="text" 
            value={prod.detalle} 
            onChange={(e) => handleInputChange(index, 'detalle', e.target.value)} 
        />

        {/* V. Unitario: BLOQUEADO */}
        <input 
            type="number" 
            value={prod.vUnitario} 
            readOnly 
            style={{ backgroundColor: '#f5f5f5', color: '#666' }}
        />
        
        <span className="v-total">
            {(Number(prod.vTotal) || 0).toLocaleString('es-CO', { 
                style: 'currency', 
                currency: 'COP',
                minimumFractionDigits: 0 
            })}
        </span>

            {index > 0 ? (
            <button 
                type="button" 
                className="delete-product"
                onClick={() => eliminarFilaProducto(index)}
            >
                ❎
            </button>
        ) : (
            /* Espacio vacío para mantener la alineación del grid en la primera fila */
            <div style={{ width: '32px' }}></div> 
        )}
    </div>
))}

<button 
    type="button" 
    className="btn btn-primary btn-sm"
    onClick={agregarFilaProducto}
>
    + Añadir Producto
</button>

{/* DATALIST: Debe estar FUERA del map y el ID debe ser 'lista-productos' */}
<datalist id="lista-productos">
    {sugerenciasProd.map((p) => (
        <option key={p.id} value={p.codigo}>
            {p.nombre} - ${p.precio}
        </option>
    ))}
</datalist>
                  
                {/*******************TOTALES************************/}

 
                <h2 className="section-title">4. Totales</h2>

                <div className="total-line">
                <label>Subtotal</label>
                <span>${subtotal ? subtotal.toFixed(2) : "0.00"}</span>
               </div>

               <div className="total-line">
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