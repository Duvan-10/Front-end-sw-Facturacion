import React, { useState, useEffect } from 'react'; 

// =======================================================
// COMPONENTE PRINCIPAL: PRODUCTOS 
//   - Muestra "Precio Total" calculado.
// =======================================================

function Productos() {
    
    // URL base de la API 
    const apiBaseUrl = 'http://localhost:8080/api/productos'; 
    
    // Obtener el token JWT
    const getAuthToken = () => {
        return localStorage.getItem('authToken'); 
    };

    // 1. Estados principales
    const [allProducts, setAllProducts] = useState([]); 
    const [products, setProducts] = useState([]); 
    
    // Estados de control
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0); 
    const [searchQuery, setSearchQuery] = useState('');
    
    
    // =======================================================
    // I. LÓGICA DE CARGA DE DATOS (fetch GET)
    // =======================================================

    const loadProducts = async () => {
        const token = getAuthToken();
        if (!token) {
            setError("Error de autenticación: Token no encontrado. No se puede cargar la lista.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${apiBaseUrl}?search=${searchQuery}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}` 
                }
            });
            
            if (response.status === 401) throw new Error("Acceso denegado. Token inválido o expirado.");
            if (!response.ok) throw new Error(`Error al cargar datos: ${response.status}`);
            
            const result = await response.json();
            
            const productArray = Array.isArray(result.data) ? result.data : []; 
            
            setAllProducts(productArray);
            
        } catch (err) {
            console.error("Error al cargar productos de la API:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        loadProducts(); 
    }, [refreshKey, searchQuery]); 
    
    useEffect(() => {
        setProducts(allProducts);
    }, [allProducts]);
    
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };


    // =======================================================
    // II. CÁLCULO DE PRECIO FINAL (Precio Base + Impuesto)
    // =======================================================

    // 🚨 Función renombrada y lógica actualizada.
    const calculateFinalPrice = (price, taxPercentage) => {
        const p = parseFloat(price) || 0;
        const t = parseFloat(taxPercentage) || 0;
        
        // Fórmula: Precio Total = Precio Base * (1 + (Impuesto % / 100))
        const finalPrice = p * (1 + (t / 100));
        
        return finalPrice.toFixed(2);
    };


    // =======================================================
    // III. HANDLER DE COMUNICACIÓN Y NAVEGACIÓN
    // =======================================================
    
    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data === 'listUpdated') {
                setRefreshKey(prev => prev + 1); 
            }
        };

        window.addEventListener('message', handleMessage);
        
        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, []); 

    const handleCreateNew = () => {
        window.open('/productos/crear', '_blank'); 
    };

    const handleEdit = (product) => {
        window.open(`/productos/editar/${product.id}`, '_blank');
    };
    
    
    // =======================================================
    // IV. RENDERIZADO (Tabla Final)
    // =======================================================

    return (
        <div className="main-content">
            <h1 className="module-title">Gestión de Productos</h1>

            {/* --- Controles --- */}
            <section className="controls-section card">
                
                <div className="search-bar">
                    <label htmlFor="search">Buscar Producto (Código o Nombre):</label>
                    <input 
                        type="text" 
                        id="search"
                        className="search-input" 
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Buscar por Código o Nombre..."
                        disabled={loading}
                    />
                </div>
                
                <button 
                    className={`btn btn-primary btn-register-product`} 
                    onClick={handleCreateNew} 
                    disabled={loading}
                >
                    Registrar Nuevo Producto
                </button>
            </section>
            
            <hr/>
            
            
            {/* --- Listado de Productos (Tabla) --- */}
            <section className="list-section">
                <h2>Listado de Productos ({products.length} encontrados)</h2>
                
                {loading && <p>Cargando productos...</p>}
                {error && <p style={{ color: 'red' }}>Error de conexión/autenticación: {error}. Por favor, inicie sesión o verifique la API.</p>}

                {!loading && !error && products.length === 0 ? (
                    <p>No hay productos registrados en la base de datos o no coinciden con la búsqueda.</p>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Nombre</th>
                                <th>Precio</th>
                                <th>Impuesto (%)</th> 
                                <th>Precio Total</th> {/* 🚨 Nombre de columna corregido */}
                                <th>Acciones</th> 
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product.id}>
                                    <td>{product.codigo}</td> 
                                    <td>{product.nombre}</td>
                                    <td>${parseFloat(product.precio || 0).toFixed(2)}</td>
                                    
                                    {/* Porcentaje guardado en la DB */}
                                    <td>{parseFloat(product.impuesto_porcentaje || 0).toFixed(2)}%</td>
                                    
                                    {/* 🚨 Cálculo del Precio Total (Base + Impuesto) */}
                                    <td>
                                        ${calculateFinalPrice(product.precio, product.impuesto_porcentaje)}
                                    </td>
                                    
                                    <td className="actions-cell">
                                        <button 
                                            className="btn btn-sm btn-edit" 
                                            onClick={() => handleEdit(product)} 
                                            disabled={loading}
                                        >
                                            Editar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
        </div>
    );
}

export default Productos;