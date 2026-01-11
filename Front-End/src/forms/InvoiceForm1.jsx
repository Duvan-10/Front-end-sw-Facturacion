import React from 'react';
import '../styles/forms_invoice_2.css';


const RegistrarFactura = () => {
  return (
    <div className="container">
      <form className="app-form card">
        <h2 className="module-title">Registrar Nueva Factura</h2>

        {/* Número y Fecha */}
        <div className="grid-2">
          <label>
            Número de Factura
            <input type="text" name="numeroFactura" readOnly defaultValue="FAC-0001" />
          </label>
          <label>
            Fecha
            <input type="date" name="fechaEmision" />
          </label>
        </div>

        {/* Pago */}
        <div className="pago">
          <span>PAGO:</span>
          <label>
            <input type="radio" name="pagoEstado" value="Default" defaultChecked /> Default
          </label>
          <label>
            <input type="radio" name="pagoEstado" value="Si" /> Si
          </label>
          <label>
            <input type="radio" name="pagoEstado" value="No" /> No
          </label>
        </div>

        {/* Cliente */}
        <h2 className="section-title">2. Datos del Cliente</h2>
        <div className="section-group">
          <label>
            Tipo Doc.
            <select name="tipo_identificacion">
              <option>C.C.</option>
              <option>NIT</option>
              <option>C.E.</option>
            </select>
          </label>
          <label>
            NIT/CC
            <input 
              type="text" 
              list="clientes-sugerencias" 
              placeholder="Escribe NIT o Nombre..." 
            />
          </label>
          <label>
            Nombre - Razón Social 
            <input name="nombre" />
          </label>
          <label>
            Teléfono 
            <input name="telefono" />
          </label>
          <label>
            Dirección 
            <input name="direccion" />
          </label>
          <label>
            Correo 
            <input name="correo" />
          </label>
        </div>

        <datalist id="clientes-sugerencias">
          <option value="900123456">Empresa Alfa S.A.S</option>
          <option value="1020304050">Juan Pérez</option>
          <option value="123456789">Comercial Beta Ltda</option>
        </datalist>

        {/* Productos */}
        <h2 className="section-title">3. Detalle de Productos</h2>
        <div className="product-grid product-header">
          <span>Código</span>
          <span>Cant.</span>
          <span>Detalle</span>
          <span>V.Unitario</span>
          <span>V.Total</span>
          <span></span>
        </div>

        {/* Ejemplo de fila */}
        <div className="product-grid product-row">
          <input 
            type="text" 
            name="prod[0][codigo]" 
            list="lista-productos" 
            placeholder="Código" 
          />
          <input 
            type="number" 
            name="prod[0][cantidad]" 
            defaultValue="1" 
            min="1" 
          />
          <input 
            type="text" 
            name="prod[0][detalle]" 
            placeholder="Detalle" 
          />
          <input 
            type="number" 
            name="prod[0][vUnitario]" 
            defaultValue="0" 
            step="0.01" 
          />
          <span className="v-total">0</span>
          <div className="action-buttons">
            <button 
              type="button" 
              className="btn btn-primary btn-add-inline" 
              title="Añadir fila"
            >
              +
            </button>
            <button 
              type="button" 
              className="delete-product" 
              title="Eliminar fila"
            >
              ✕
            </button>
          </div>
        </div>

        <datalist id="lista-productos">
          <option value="PRD-001">Producto A - $12000</option>
          <option value="PRD-002">Producto B - $35000</option>
          <option value="PRD-003">Producto C - $7800</option>
        </datalist>

        {/* Totales */}
        <h2 className="section-totales">4. Totales</h2>
        <div className="total-line">
          <label>Subtotal</label>
          <span>$0.00</span>
        </div>
        <div className="iva">
          <label>IVA</label>
          <span>$0.00</span>
        </div>
        <div className="total-line total-final">
          <label>Total</label>
          <span>$0.00</span>
        </div>

        {/* Botones */}
        <div className="final-buttons-group">
          <button type="submit" className="btn btn-success">Crear Factura</button>
          <button type="button" className="btn btn-danger">Cancelar</button>
        </div>
      </form>
    </div>
  );
};

export default RegistrarFactura;