import React, { useState } from 'react'; 
import ProductForm from '../../components/ProductForm/ProductForm'; 

// =======================================================
// DATOS Y CONSTANTES (Simulación)
// =======================================================

const initialProducts = [
    { id: 'PROD-001', code: 'C-LPT15', name: 'Laptop Comercial i7', price: 1500.00, stock: 25 },
    { id: 'PROD-002', code: 'C-MNS05', name: 'Monitor LED 27"', price: 350.50, stock: 5 },
    { id: 'PROD-003', code: 'C-PRT22', name: 'Impresora Láser B/N', price: 180.00, stock: 0 },
];

// =======================================================
// COMPONENTE PRINCIPAL: PRODUCTOS (Más limpio)
// =======================================================

function Productos() {
    // 1. Estados principales
    const [products, setProducts] = useState(initialProducts); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 2. Control de UI y Edición
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingProductData, setEditingProductData] = useState(null); 
    
    // ... (Lógica de filtrado/búsqueda/paginación) ...

    const handleToggleForm = (productToEdit = null) => {
        if (productToEdit) {
            setEditingProductData(productToEdit);
            setIsFormVisible(true);
        } else {
            setIsFormVisible(!isFormVisible);
            setEditingProductData(null);
        }
    };

    const handleSubmitProduct = (data) => {
        console.log("Datos de Producto a guardar/crear:", data);
        alert(`Producto ${data.id} guardado con éxito.`);
        
        // Simular guardar/actualizar en el estado local
        // Nota: Implementa la lógica real aquí
        
        handleToggleForm(null); // Cerrar formulario al guardar
    };

    // Handler para simular la edición (abre el formulario)
    const handleEdit = (product) => {
        handleToggleForm(product);
    };


    // =======================================================
    // III. RENDERIZADO
    // =======================================================

    return (
        <div className="main-content">
            <h1 className="module-title">Gestión de Productos</h1>

            {/* --- 1. Controles y Botón de Registro --- */}
            <section className="controls-section card">
                {/* ... Controles de búsqueda aquí ... */}
                
                <button 
                    className={`btn ${isFormVisible ? 'btn-danger' : 'btn-primary'} btn-register-product`} 
                    onClick={() => handleToggleForm(null)}
                >
                    {isFormVisible ? 'Cancelar Registro' : 'Registrar Nuevo Producto'}
                </button>
            </section>
            
            <hr/>

            {/* --- 2. Formulario de Creación/Edición (Usando el componente importado) --- */}
            {isFormVisible && (
                 <section className="form-section card">
                    <ProductForm 
                        initialData={editingProductData} 
                        onCancel={() => handleToggleForm(null)}
                        onSubmit={handleSubmitProduct} 
                    />
                 </section>
            )}
            
            
            {/* --- 3. Listado de Productos (Tabla) --- */}
            <section className="list-section">
                <h2>Listado de Productos</h2>
                
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Nombre</th>
                            <th>Precio</th>
                            <th>Stock</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product.id}>
                                <td>{product.code}</td>
                                <td>{product.name}</td>
                                <td>${parseFloat(product.price).toFixed(2)}</td>
                                <td>
                                    <span className={`stock-indicator stock-${product.stock === 0 ? 'zero' : product.stock <= 10 ? 'low' : 'ok'}`}>
                                        {product.stock}
                                    </span>
                                </td>
                                <td className="actions-cell">
                                    <button className="btn btn-sm btn-edit" onClick={() => handleEdit(product)}>Editar</button>
                                    <button className="btn btn-sm btn-danger" onClick={() => alert(`Eliminar ${product.id}`)}>Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
}

export default Productos;