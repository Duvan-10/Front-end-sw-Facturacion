import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../api';
import '../../styles/global.css';

function Productos() {
    const navigate = useNavigate();
    const apiBaseUrl = `${API_URL}/productos`;
    
    // Lee el token de sessionStorage (consistente con AuthContext)
    const getAuthToken = () => {
        return sessionStorage.getItem('token'); 
    };

    const [products, setProducts] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0); 
    const [inputValue, setInputValue] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const loadProducts = async () => {
        const token = getAuthToken();
        
        // Si no hay token, redirigir al usuario al Login
        if (!token) {
            setError("Sesión expirada. Redirigiendo...");
            setLoading(false);
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${apiBaseUrl}?search=${searchQuery}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}` 
                }
            });
            
            if (response.status === 401) {
                // Si el token es inválido según el servidor, limpiar y salir
                sessionStorage.removeItem('token');
                throw new Error("Acceso denegado. Inicia sesión nuevamente.");
            }
            
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            
            const result = await response.json();
            setProducts(Array.isArray(result.data) ? result.data : []);
            setError(null);
        } catch (err) {
            console.error("Error al cargar productos:", err);
            setError(err.message);
            if (err.message.includes("Acceso denegado")) {
                setTimeout(() => navigate('/login'), 2000);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setSearchQuery(inputValue);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [inputValue]);

    useEffect(() => {
        loadProducts(); 
    }, [refreshKey, searchQuery]); 

    const handleSearchChange = (e) => {
        setInputValue(e.target.value);
    };

    const calculateFinalPrice = (price, taxPercentage) => {
        const p = parseFloat(price) || 0;
        const t = parseFloat(taxPercentage) || 0;
        const finalPrice = p * (1 + (t / 100));
        return finalPrice.toFixed(2);
    };

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
                        value={inputValue} 
                        onChange={handleSearchChange}
                        placeholder="Escribe para buscar..."
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
                
                {loading && <p className="loading-text">Cargando datos...</p>}
                {error && (
                    <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '4px', marginBottom: '10px' }}>
                        ⚠️ {error}
                    </div>
                )}

                {!loading && products.length === 0 && !error ? (
                    <p>No se encontraron productos.</p>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Nombre</th>
                                <th>Descripción</th>
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
                                    <td>{product.descripcion || "Sin descripción"}</td>
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