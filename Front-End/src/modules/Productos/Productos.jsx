import React, { useState } from 'react'; 
// NOTA: Se elimina la importación de ProductForm ya que se renderizará en otra ruta
// import ProductForm from '../../components/ProductForm/ProductForm'; 

// =======================================================
// DATOS Y CONSTANTES (Simulación)
// =======================================================

const initialProducts = [
    { id: 'PROD-001', code: 'C-LPT15', name: 'Laptop Comercial i7', price: 1500.00, stock: 25 },
    { id: 'PROD-002', code: 'C-MNS05', name: 'Monitor LED 27"', price: 350.50, stock: 5 },
    { id: 'PROD-003', code: 'C-PRT22', name: 'Impresora Láser B/N', price: 180.00, stock: 0 },
];

// =======================================================
// COMPONENTE PRINCIPAL: PRODUCTOS (Ajustado a Navegación Externa)
// =======================================================

function Productos() {
    // 1. Estados principales
    const [products, setProducts] = useState(initialProducts); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // **ESTADOS ELIMINADOS: isFormVisible y editingProductData ya no se usan**
    
    // **FUNCIONES ELIMINADAS: handleToggleForm, handleSubmitProduct y handleEdit ya no son necesarias aquí**

    // =======================================================
    // II. HANDLERS DE NAVEGACIÓN (NUEVA LÓGICA)
    // =======================================================
    
    const handleCreateNew = () => {
        // Abre la ruta de creación en una nueva pestaña (Ruta: /productos/crear)
        window.open('/productos/crear', '_blank'); 
    };

    const handleEdit = (product) => {
        // Abre la ruta de edición en una nueva pestaña, usando el ID del producto
        window.open(`/productos/editar/${product.id}`, '_blank');
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
                    // Cambiado el onClick para usar la nueva función
                    className={`btn btn-primary btn-register-product`} 
                    onClick={handleCreateNew} // <-- NUEVA FUNCIÓN
                >
                    Registrar Nuevo Producto
                </button>
            </section>
            
            <hr/>

            {/* --- 2. EL FORMULARIO YA NO SE RENDERIZA AQUÍ --- */}
            {/* Eliminada la sección condicional: {isFormVisible && (<section> <ProductForm ... /> </section>)} */}
            
            
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
                                    <button 
                                        className="btn btn-sm btn-edit" 
                                        // Cambiado el onClick para usar la nueva función
                                        onClick={() => handleEdit(product)} 
                                    >
                                        Editar
                                    </button>
                                    <button 
                                        className="btn btn-sm btn-danger" 
                                        onClick={() => alert(`Simulando: Eliminar ${product.id}`)}
                                    >
                                        Eliminar
                                    </button>
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