import React, { useState } from 'react';

// Se usará la clase CSS 'product-form card' definida en tu ProductForm.css o Productos.css

const ProductForm = ({ initialData, onCancel, onSubmit }) => {
    
    // Estado para manejar los datos del producto
    const [productData, setProductData] = useState(initialData || {
        code: '',
        name: '',
        description: '',
        price: 0.00,
        stock: 0,
        // Puede incluir campos adicionales como 'unidad de medida', 'categoría', etc.
    });

    // Handler genérico para actualizar el estado del formulario
    const handleChange = (e) => {
        const { id, value, type } = e.target;
        // Convertir números para campos numéricos
        const newValue = type === 'number' ? parseFloat(value) || 0 : value;
        
        setProductData(prev => ({
            ...prev,
            [id]: newValue
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Generar un ID si es nuevo (simulación)
        const finalData = { 
            ...productData,
            id: initialData?.id || `PROD-${Math.floor(Math.random() * 1000)}` 
        };
        onSubmit(finalData); 
    };

    return (
        <form className="product-form card" onSubmit={handleSubmit}>
            <h2 className="module-title" style={{ textAlign: 'center' }}>
                {initialData ? 'Editar Producto' : 'Registrar Nuevo Producto'}
            </h2>
            
            <div className="section-group product-fields">
                
                {/* Código de Producto (SKU) */}
                <div className="field-col">
                    <label htmlFor="code">Código</label>
                    <input type="text" id="code" placeholder="PROD-XXX" value={productData.code} onChange={handleChange} required />
                </div>
                
                {/* Nombre */}
                <div className="field-col">
                    <label htmlFor="name">Nombre del Producto</label>
                    <input type="text" id="name" placeholder="Nombre comercial" value={productData.name} onChange={handleChange} required />
                </div>

                {/* Precio Unitario */}
                <div className="field-col">
                    <label htmlFor="price">Precio Unitario ($)</label>
                    <input type="number" id="price" step="0.01" min="0" placeholder="0.00" value={productData.price} onChange={handleChange} required />
                </div>
                
                {/* Stock Actual */}
                <div className="field-col">
                    <label htmlFor="stock">Stock Actual</label>
                    <input type="number" id="stock" min="0" placeholder="0" value={productData.stock} onChange={handleChange} required />
                </div>
                
                {/* Descripción (Ocupa dos columnas si el grid lo permite) */}
                <div className="field-col description-field" style={{ gridColumn: '1 / -1' }}>
                    <label htmlFor="description">Descripción Detallada</label>
                    <textarea 
                        id="description" 
                        rows="3" 
                        placeholder="Características, unidad de medida, etc." 
                        value={productData.description} 
                        onChange={handleChange}
                    />
                </div>
            </div>

            {/* Botones de Acción */}
            <div className="final-buttons-group" style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '30px' }}>
                <button 
                    type="submit" 
                    className="btn btn-success" 
                    style={{ width: '200px' }}
                >
                    {initialData ? 'Guardar Cambios' : 'Registrar Producto'}
                </button>
                <button 
                    type="button" 
                    className="btn btn-danger" 
                    onClick={onCancel} 
                    style={{ width: '200px' }}
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
};

export default ProductForm;