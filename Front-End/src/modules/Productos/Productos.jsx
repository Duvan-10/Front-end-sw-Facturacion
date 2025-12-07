import React, { useState } from 'react';
import './Productos.css';

function ProductCatalog() {
  // 1. Estado para almacenar los datos del nuevo producto del formulario
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    price: 0,
    tax: 0,
  });

  // 2. Estado para almacenar la lista de productos registrados
  const [products, setProducts] = useState([
    // Datos de ejemplo
    { id: 1, code: 'P001', name: 'Laptop Pro', price: 1200.00, tax: 19 },
    { id: 2, code: 'S010', name: 'Soporte Técnico Mensual', price: 50.00, tax: 0 },
  ]);

  // Maneja el cambio en los inputs del formulario
  const handleChange = (e) => {
    const { id, value } = e.target;
    
    // Mapeo de IDs del HTML a las claves del estado
    let keyName = id;
    if (id === 'Code') keyName = 'code'; 
    if (id === 'nombre') keyName = 'name';
    if (id === 'precio') keyName = 'price';
    if (id === 'impuesto') keyName = 'tax';

    setFormData({ 
        ...formData, 
        [keyName]: id === 'precio' || id === 'impuesto' ? parseFloat(value) : value 
    });
  };

  // Maneja el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();

    const newProduct = {
      id: products.length + 1,
      code: formData.code,
      name: formData.name,
      price: formData.price,
      tax: formData.tax,
    };

    // Agregar el nuevo producto a la lista
    setProducts([...products, newProduct]);
    
    // Limpiar el formulario
    setFormData({ code: '', name: '', price: 0, tax: 0 });

    alert(`Producto/Servicio ${newProduct.name} registrado con código ${newProduct.code}.`);
  };

  return (
    <>
      <header>Catálogo de Productos y Servicios</header>

      {/* --- Formulario de registro --- */}
      <section className="form-section">
        <h2>Registrar nuevo producto</h2>
        <form onSubmit={handleSubmit}>
          
          <label htmlFor="Code">N° Código</label>
          <input 
            type="text" 
            id="Code" 
            value={formData.code} 
            onChange={handleChange} 
            required 
          />

          <label htmlFor="nombre">Nombre del producto/Servicio:</label>
          <input 
            type="text" 
            id="nombre" 
            value={formData.name} 
            onChange={handleChange} 
            required 
          />

          <label htmlFor="precio">Precio unitario:</label>
          <input 
            type="number" 
            id="precio" 
            min="0" 
            value={formData.price} 
            onChange={handleChange} 
            required 
          />

          <label htmlFor="impuesto">Impuesto (%):</label>
          <input 
            type="number" 
            id="impuesto" 
            min="0" 
            max="100" 
            value={formData.tax} 
            onChange={handleChange} 
            required 
          />
          <button type="submit" className="btn">Registrar Producto</button>
        </form>
      </section>
      
      {/* --- Listado de productos --- */}
      <section className="list-section">
        <h2>Productos registrados</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>N° Código</th>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Impuesto (%)</th>
            </tr>
          </thead>
          <tbody>
            {/* Iteración de productos usando map() */}
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.code}</td>
                <td>{product.name}</td>
                <td>${product.price.toFixed(2)}</td>
                <td>{product.tax}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}

export default ProductCatalog;