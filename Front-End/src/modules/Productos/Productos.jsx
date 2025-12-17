import React, { useState, useEffect } from 'react'; 

function Productos() {
    const apiBaseUrl = 'http://localhost:8080/api/productos'; 
    
    const getAuthToken = () => {
        return localStorage.getItem('authToken'); 
    };

    // 1. Estados principales
    const [products, setProducts] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0); 
    
    // 🚨 ESTADO SEPARADO: Uno para el valor del input (inmediato) 
    // y otro para la búsqueda real (con retraso)
    const [inputValue, setInputValue] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // =======================================================
    // I. LÓGICA DE CARGA DE DATOS (fetch GET)
    // =======================================================

    const loadProducts = async () => {
        const token = getAuthToken();
        if (!token) {
            setError("Error de autenticación: Token no encontrado.");
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            // Se usa searchQuery (el valor con debounce) para la API
            const response = await fetch(`${apiBaseUrl}?search=${searchQuery}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}` 
                }
            });
            
            if (response.status === 401) throw new Error("Acceso denegado. Token inválido.");
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            
            const result = await response.json();
            setProducts(Array.isArray(result.data) ? result.data : []);
            setError(null);
        } catch (err) {
            console.error("Error al cargar productos:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // --- EFFECT 1: Debounce para la búsqueda ---
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setSearchQuery(inputValue);
        }, 500); // Espera 500ms después de que el usuario deja de escribir

        return () => clearTimeout(timeoutId); // Limpia el timer si el usuario sigue escribiendo
    }, [inputValue]);

    // --- EFFECT 2: Carga cuando cambia la búsqueda real o el refreshKey ---
    useEffect(() => {
        loadProducts(); 
    }, [refreshKey, searchQuery]); 

    // Handler del input (ahora es instantáneo y no bloquea el foco)
    const handleSearchChange = (e) => {
        setInputValue(e.target.value);
    };

    // =======================================================
    // II. CÁLCULO DE PRECIO FINAL
    // =======================================================
    const calculateFinalPrice = (price, taxPercentage) => {
        const p = parseFloat(price) || 0;
        const t = parseFloat(taxPercentage) || 0;
        const finalPrice = p * (1 + (t / 100));
        return finalPrice.toFixed(2);
    };

    // =======================================================
    // III. HANDLERS Y MENSAJES
    // =======================================================
    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data === 'listUpdated') {
                setRefreshKey(prev => prev + 1); 
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []); 

    const handleCreateNew = () => window.open('/productos/crear', '_blank');
    const handleEdit = (product) => window.open(`/productos/editar/${product.id}`, '_blank');

    return (
        <div className="main-content">
            <h1 className="module-title">Gestión de Productos</h1>

            <section className="controls-section card">
                <div className="search-bar">
                    <label htmlFor="search">Buscar Producto (Código o Nombre):</label>
                    <input 
                        type="text" 
                        id="search"
                        className="search-input" 
                        value={inputValue} // Usa inputValue para que sea fluido
                        onChange={handleSearchChange}
                        placeholder="Escribe para buscar..."
                        // 🚨 IMPORTANTE: No deshabilitar el input mientras carga 
                        // para no perder el foco.
                    />
                </div>
                
                <button 
                    className="btn btn-primary btn-register-product" 
                    onClick={handleCreateNew}
                >
                    Registrar Nuevo Producto
                </button>
            </section>
            
            <hr/>
            
            <section className="list-section">
                <h2>Listado de Productos ({products.length})</h2>
                
                {loading && <p className="loading-text">Buscando...</p>}
                {error && <p style={{ color: 'red' }}>Error: {error}</p>}

                {!loading && products.length === 0 ? (
                    <p>No se encontraron productos.</p>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Nombre</th>
                                <th>Precio</th>
                                <th>Impuesto (%)</th> 
                                <th>Precio Total</th>
                                <th>Acciones</th> 
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product.id}>
                                    <td>{product.codigo}</td> 
                                    <td>{product.nombre}</td>
                                    <td>${parseFloat(product.precio || 0).toFixed(2)}</td>
                                    <td>{parseFloat(product.impuesto_porcentaje || 0).toFixed(2)}%</td>
                                    <td>${calculateFinalPrice(product.precio, product.impuesto_porcentaje)}</td>
                                    <td className="actions-cell">
                                        <button className="btn btn-sm btn-edit" onClick={() => handleEdit(product)}>
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