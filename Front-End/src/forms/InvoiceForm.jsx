import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaTrash } from "react-icons/fa";
import { useInvoiceLogic } from './logica.js';
import '../styles/forms_invoices.css';

const InvoiceForm = ({ onSuccess, onCancel }) => {
  const navigate = useNavigate(); 
  
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/home/facturas');
    }
  }; 

  const { 
    fechaVencimiento,
    setFechaVencimiento,
    numeroFactura, 
    fechaEmision, 
    setFechaEmision,
    identificacion, 
    seleccionarCliente, 
    autocompletarClienteConTab,
    handleClienteChange,
    handleIdentificacionChange,
    cliente, 
    sugerencias,
    sugerenciasNombre,
    seleccionarClientePorNombre,
    verificarClienteExiste,
    verificarNombreExiste,
    erroresCliente,
    productosFactura, 
    handleInputChange, 
    autocompletarProductoConTab,
    agregarFilaProducto, 
    eliminarFilaProducto,
    buscarProductos, 
    sugerenciasProd,
    sugerenciasProdNombre,
    buscarProductosPorNombre,
    verificarProductoExiste,
    verificarProductoExistePorNombre,
    seleccionarProductoPorNombre,
    erroresProductos,
    subtotal, 
    iva, 
    totalGeneral,
    handleSubmit: handleFormSubmit
  } = useInvoiceLogic();

  // Función envolvente para manejar el submit con callbacks opcionales
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Ejecutar la lógica original
    const result = await handleFormSubmit(e);
    
    // Si la factura se creó exitosamente
    if (result === true) {
      // Si hay callback de éxito, ejecutarlo
      if (onSuccess) {
        onSuccess();
      } else {
        // Comportamiento por defecto: navegar
        navigate('/home/facturas');
      }
    }
    // Si result === false, simplemente no hacer nada (el usuario ya vio los alerts de error)
  };
  
  return (
    <form className="app-form card" onSubmit={handleSubmit}>
      <h2 className="module-title">Registrar Nueva Factura</h2>

 {/*********************** N°FACTURA Y FECHA*****************************/}
    
             <div className='Subtitulo'>
                
                <div className='Numero-Fecha'>
                
                 <label className='Numero'>
                 <input type="text" value={numeroFactura} readOnly /> Número de Factura</label>
                 
                 <label className='Fecha'>
                 <input type="date" value={fechaEmision} onChange={(e) => setFechaEmision(e.target.value)} /> Fecha Emisión</label>

                 <label className='Fecha'>
                 <input type="date" value={fechaVencimiento} onChange={(e) => setFechaVencimiento(e.target.value)} /> Fecha Vencimiento</label>
                 
                </div>
            </div>    
                
                
{/* ******************** DATOS DEL CLIENTE *********************************** */}

<h2 className="section-title">2. Datos del Cliente</h2>


<div className="section-group">{/*Clase Global Inputs y Label Campos Detalles Clientes*/}


    <div className="client-data input">
       <label>identificacion</label>
        <input 
        type="text" 
        value={identificacion}
        onChange={handleIdentificacionChange}
        onBlur={verificarClienteExiste}
        onKeyDown={autocompletarClienteConTab}
        list="clientes-sugerencias-id" 
        placeholder="Escribe identificación..."
        className={erroresCliente.identificacion ? 'input-error' : ''}
        />
        {erroresCliente.identificacion && (
          <span className="error-message">{erroresCliente.identificacion}</span>
        )}

        <datalist id="clientes-sugerencias-id">
          {sugerencias.map((c) => (
            <option 
                key={c.id} 
                value={c.identificacion}>
                {c.nombre_razon_social}
            </option>
         ))}
       </datalist>

    </div>

    <div className="client-data input">
        <label>Nombre - Razón Social</label>
        <input 
        name="nombre" 
        value={cliente.nombre} 
        onChange={handleClienteChange}
        onBlur={verificarNombreExiste}
        list="clientes-sugerencias-nombre"
        placeholder="Escribe nombre..."
        className={erroresCliente.nombre ? 'input-error' : ''}
        />
        {erroresCliente.nombre && (
          <span className="error-message">{erroresCliente.nombre}</span>
        )}
        
        <datalist id="clientes-sugerencias-nombre">
          {sugerenciasNombre.map((c) => (
            <option 
                key={c.id} 
                value={c.nombre_razon_social}
                onClick={() => seleccionarClientePorNombre(c)}>
                {c.identificacion}
            </option>
         ))}
       </datalist>
    </div>



    <div className="client-data input">
        <label>Teléfono</label>
        <input 
        name="telefono" 
        value={cliente.telefono} 
        onChange={handleClienteChange}
        placeholder="Mínimo 7 dígitos"
        className={erroresCliente.telefono ? 'input-error' : ''}
        />
        {erroresCliente.telefono && (
          <span className="error-message">{erroresCliente.telefono}</span>
        )}
    </div>

        
    <div className="client-data input">
        <label>Dirección</label>
        <input 
        name="direccion" 
        value={cliente.direccion} 
        onChange={handleClienteChange}
        placeholder="Calle, número, etc."
        className={erroresCliente.direccion ? 'input-error' : ''}
        />
        {erroresCliente.direccion && (
          <span className="error-message">{erroresCliente.direccion}</span>
        )}
    </div>


    <div className="client-data input">
        <label>Correo</label>
        <input 
        name="correo" 
        type="email"
        value={cliente.correo} 
        onChange={handleClienteChange}
        placeholder="usuario@dominio.com"
        className={erroresCliente.correo ? 'input-error' : ''}
        />
        {erroresCliente.correo && (
          <span className="error-message">{erroresCliente.correo}</span>
        )}
    </div>


</div>
                 

        


{/********************* DETALLES DEL PRODUCTO *********************************** */}
 <h2 className="section-title Product">3. Detalle de Productos</h2>
{/* Encabezado de la cuadrícula */}

<div className="product-grid product-header">
    <span>Código</span>
    <span>Cant.</span>
    <span>Detalle</span>
    <span>V.Unitario</span>
    <span>Desc.%</span>
    <span>V.Total</span>
    <span></span>
</div>

{productosFactura.map((prod, index) => (
    <div className="product-grid product-row" key={index}>
        {/* Código con búsqueda */}
        <div className="product-field-container">
        <input 
            type="text" 
            value={prod.codigo} 
            onChange={(e) => {
                handleInputChange(index, 'codigo', e.target.value);
                buscarProductos(e.target.value);
            }}
            onKeyDown={(e) => autocompletarProductoConTab(e, index)}
            onBlur={(e) => verificarProductoExiste(index, e.target.value)}
            list="lista-productos"
            placeholder="Código"
            className={erroresProductos[index]?.codigo ? 'input-error' : ''}
        />
        {erroresProductos[index]?.codigo && (
          <span className="error-message">{erroresProductos[index].codigo}</span>
        )}
        </div>
        
        {/* Cantidad */}
        <div className="product-field-container">
        <input 
            type="number" 
            value={prod.cantidad}
            onChange={(e) => handleInputChange(index, 'cantidad', e.target.value)}
            min="1"
            placeholder="Cant."
            className={erroresProductos[index]?.cantidad ? 'input-error' : ''}
        />
        {erroresProductos[index]?.cantidad && (
          <span className="error-message">{erroresProductos[index].cantidad}</span>
        )}
        </div>
        
        {/* Detalle */}
        <div className="product-field-container">
        <input 
            type="text" 
            value={prod.detalle}
            onChange={(e) => {
                handleInputChange(index, 'detalle', e.target.value);
                buscarProductosPorNombre(e.target.value);
            }}
            onBlur={(e) => verificarProductoExistePorNombre(index, e.target.value)}
            list="lista-productos-nombre"
            placeholder="Detalle"
            className={erroresProductos[index]?.detalle ? 'input-error' : ''}
        />
        {erroresProductos[index]?.detalle && (
          <span className="error-message">{erroresProductos[index].detalle}</span>
        )}
        </div>
        
        {/* V.Unitario */}
        <div className="product-field-container">
        <input 
            type="number" 
            value={prod.vUnitario} 
            onChange={(e) => handleInputChange(index, 'vUnitario', e.target.value)}
            placeholder="Unitario"
            className={erroresProductos[index]?.vUnitario ? 'input-error' : ''}
        />
        {erroresProductos[index]?.vUnitario && (
          <span className="error-message">{erroresProductos[index].vUnitario}</span>
        )}
        </div>

        {/* Descuento */}
        <div className="product-field-container">
        <input 
            type="number" 
            value={prod.descuento} 
            onChange={(e) => handleInputChange(index, 'descuento', e.target.value)}
            min="0"
            max="100"
            placeholder="%"
            className={erroresProductos[index]?.descuento ? 'input-error' : ''}
        />
        {erroresProductos[index]?.descuento && (
          <span className="error-message">{erroresProductos[index].descuento}</span>
        )}
        </div>

        {/* Columna V.Total */}
        <span className="v-total">
            ${Math.round(prod.vTotal).toLocaleString('es-CO')}
        </span>


       
       
     {/* COLUMNA DE ACCIONES */}
       <div className="action-buttons">
         {/* Botón Añadir (siempre visible o solo en la última fila) */}
         {index === productosFactura.length - 1 && (
        
          <button 
            type="button" 
            className="btn-primaryy"
            onClick={agregarFilaProducto}
            title="Añadir fila"
          >
            <FaPlus />
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
            <FaTrash />
             </button>
           )}
      </div>
    </div>
))}

<div className="rayita"><br></br></div>

{/* DATALIST: Debe estar FUERA del map y el ID debe ser 'lista-productos' */}
<datalist id="lista-productos">
    {sugerenciasProd.map((p) => (
        <option key={p.id} value={p.codigo}>
            {p.nombre} - ${p.precio}
        </option>
    ))}
</datalist>

{/* DATALIST para búsqueda por nombre/detalle */}
<datalist id="lista-productos-nombre">
    {sugerenciasProdNombre.map((p) => (
        <option key={p.id} value={p.nombre}>
            {p.codigo} - ${p.precio}
        </option>
    ))}
</datalist>
                  

                      <div className='rayita'/>
                            
                      

                {/*******************TOTALES************************/}

                <h2 className="section-totales">4. Totales</h2>

                <div className="total-line">
                <label>Subtotal</label>
                <span>${subtotal ? Math.round(subtotal).toLocaleString('es-CO') : "0"}</span>
               </div>

               <div className="iva">
                <label>IVA (19%)</label>
               <span>${iva ? Math.round(iva).toLocaleString('es-CO') : "0"}</span>
               </div>

               <div className="total-line total-final">
               <label>Total</label>
               <span>${totalGeneral ? Math.round(totalGeneral).toLocaleString('es-CO') : "0"}</span></div>

             
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
        onClick={handleCancel}
    >
        Cancelar
    </button>
</div>

            </form>
        );
    };
    
    export default InvoiceForm;
    