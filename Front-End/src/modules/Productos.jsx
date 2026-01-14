import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../api';
import ProductForm from '../forms/ProductForm.jsx';
import '../styles/Modules_clients_products_factures.css';


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
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const currentUser = (() => { try { return JSON.parse(sessionStorage.getItem('user')); } catch { return null; } })();
    const isAdmin = currentUser?.role === 'admin';

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
        return Math.round(finalPrice).toLocaleString('es-CO');
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

    const handleCreateNew = () => {
        setEditingId(null);
        setShowForm(true);
    };

    const handleEdit = (product) => {
        setEditingId(product.id);
        setShowForm(true);
    };

    const handleDelete = async (product) => {
        if (!isAdmin) return;
        const ok = window.confirm(`¿Eliminar producto "${product.nombre}"?`);
        if (!ok) return;
        const token = getAuthToken();
        try {
            const res = await fetch(`${apiBaseUrl}/${product.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) { throw new Error(data.message || 'Error al eliminar producto'); }
            setRefreshKey(prev => prev + 1);
        } catch (err) {
            alert(err.message);
        }
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
    };

    const handleSaved = () => {
        setRefreshKey(prev => prev + 1);
        closeForm();
    };

    return (
        <div className="product-management">
            <h2>Gestión de Productos</h2>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="actions">
                <button 
                    className="btn-primary" 
                    onClick={handleCreateNew}
                    disabled={loading}
                >
                    ➕ Registrar Nuevo Producto
                </button>
                <input 
                    type="text" 
                    placeholder="Filtrar por Código o Nombre"
                    value={inputValue} 
                    onChange={handleSearchChange}
                />
            </div>

            {loading && <p>Cargando...</p>}

            <table className="product-table" id="tablaProductos">
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
                    {products.length > 0 ? (
                        products.map((product) => (
                            <tr key={product.id}>
                                <td>{product.codigo}</td> 
                                <td>{product.nombre}</td>
                                <td>{product.descripcion || "Sin descripción"}</td>
                                <td>${parseFloat(product.precio || 0).toFixed(2)}</td>
                                <td>{Math.round(parseFloat(product.impuesto_porcentaje || 0))}%</td>
                                <td>${calculateFinalPrice(product.precio, product.impuesto_porcentaje)}</td>
                                <td>
                                    <button className="editar btn-warning" onClick={() => handleEdit(product)} disabled={loading} title="Editar producto">✏️ Editar</button>
                                    {isAdmin && (
                                        <button className="eliminar btn-danger" onClick={() => handleDelete(product)} disabled={loading} title="Eliminar producto">🗑️ Eliminar</button>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                                No se encontraron productos.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {showForm && (
                <div className="modal-overlay" role="dialog" aria-modal="true">
                    <div className="modal-body">
                        <button className="modal-close" onClick={closeForm}>✕</button>
                        <ProductForm productId={editingId} onSuccess={handleSaved} onCancel={closeForm} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default Productos;