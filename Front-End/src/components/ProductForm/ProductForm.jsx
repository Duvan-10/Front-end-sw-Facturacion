import React, { useState } from 'react';
import { useParams } from 'react-router-dom'; // <-- NECESARIO para leer el ID de la URL

// =======================================================
// COMPONENTE: ProductForm (Ahora auto-contenido)
// =======================================================

// Eliminamos initialData, onCancel, onSubmit de los props
const ProductForm = () => {
    
    // --- I. LÓGICA DE CARGA POR URL ---
    const { id } = useParams(); // Obtiene 'PROD-00X' si estamos en /productos/editar/PROD-00X
    const isEditing = !!id;

    // Simulación: Cargar datos si estamos editando
    // En un proyecto real, harías un useEffect y un fetch con el 'id'
    const loadedData = isEditing ? {
        id: id,
        code: `SKU-${id.split('-')[1]}`,
        name: `Producto Editado ${id}`,
        description: 'Descripción cargada para edición.',
        price: 999.99,
        stock: 42,
    } : null;

    // Estado para manejar los datos del producto
    const [productData, setProductData] = useState(loadedData || {
        code: '',
        name: '',
        description: '',
        price: 0.00,
        stock: 0,
    });

    // Handler genérico para actualizar el estado del formulario (Se mantiene)
    const handleChange = (e) => {
        const { id, value, type } = e.target;
        // Convertir números para campos numéricos
        const newValue = type === 'number' ? parseFloat(value) || 0 : value;
        
        setProductData(prev => ({
            ...prev,
            [id]: newValue
        }));
    };
    
    // --- II. HANDLERS DE ACCIÓN ---
    
    // Función para cerrar la pestaña/ventana (Reemplaza a onCancel)
    const handleCloseTab = () => {
        window.close();
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Determinar ID para el mensaje
        const submissionId = id || `PROD-${Math.floor(Math.random() * 1000)}`;
        const finalData = { 
            ...productData,
            id: submissionId 
        };
        
        // Simulación: Envío de datos a la API (o a la consola)
        console.log("Datos de Producto a guardar/crear:", finalData);

        // Mostrar mensaje de confirmación
        const action = isEditing ? 'editó' : 'registró';
        alert(`✅ Producto "${finalData.name}" ${action} con éxito. La pestaña se mantendrá abierta hasta que la cierre.`);
        
        // ¡IMPORTANTE! No se llama a onSubmit/onCancel y el formulario se queda abierto.
    };

    return (
        <form className="product-form card" onSubmit={handleSubmit}>
            <h2 className="module-title" style={{ textAlign: 'center' }}>
                {isEditing ? `Editar Producto #${id}` : 'Registrar Nuevo Producto'}
            </h2>
            
            <div className="section-group product-fields">
                
                {/* Código de Producto (SKU) */}
                <div className="field-col">
                    <label htmlFor="code">Código</label>
                    <input 
                        type="text" 
                        id="code" 
                        placeholder="PROD-XXX" 
                        value={productData.code} 
                        onChange={handleChange} 
                        required 
                        // disabled={isEditing} // Opcional: Deshabilitar la edición del código
                    />
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
                    {isEditing ? 'Guardar Cambios' : 'Registrar Producto'}
                </button>
                
                {/* --- BOTÓN DE CIERRE MANUAL (Reemplaza Cancelar) --- */}
                <button 
                    type="button" 
                    className="btn btn-danger" 
                    onClick={handleCloseTab} // <-- NUEVA ACCIÓN
                    style={{ width: '200px' }}
                >
                    Cerrar Pestaña
                </button>
            </div>
        </form>
    );
};

export default ProductForm;