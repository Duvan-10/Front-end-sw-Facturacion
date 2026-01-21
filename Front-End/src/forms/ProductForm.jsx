import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../api';
import '../styles/froms_Products_Clients.css';

const ProductForm = ({ productId = null, onSuccess, onCancel }) => {
    const { id: idFromParams } = useParams();
    const navigate = useNavigate();
    const id = productId ?? idFromParams;
    const isEditing = !!id;

    const apiBaseUrl = `${API_URL}/productos`;
    
    // Obtener token desde sessionStorage (consistente con AuthContext)
    const getAuthToken = () => sessionStorage.getItem('token');
    
    const [productData, setProductData] = useState({
        codigo: '', nombre: '', precio: '', descripcion: '', impuesto_porcentaje: '0', 
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = getAuthToken();
        if (!token) {
            navigate('/login');
            return;
        }

        if (isEditing) {
            const fetchProductData = async () => {
                setLoading(true);
                try {
                    const response = await fetch(`${apiBaseUrl}/${id}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    
                    if (response.status === 401) {
                        sessionStorage.removeItem('token');
                        navigate('/login');
                        return;
                    }
                    if (!response.ok) throw new Error(`No se pudo cargar el producto.`);
                    
                    const result = await response.json();
                    const data = result.data || result; 
                    setProductData({
                        codigo: data.codigo || '',
                        nombre: data.nombre || '',
                        precio: data.precio ? String(data.precio) : '', 
                        descripcion: data.descripcion || '',
                        impuesto_porcentaje: data.impuesto_porcentaje ? String(data.impuesto_porcentaje) : '0',
                    });
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchProductData();
        }
    }, [isEditing, id, apiBaseUrl, navigate]); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = getAuthToken();
        if (!token) { navigate('/login'); return; }

        setLoading(true);
        const finalData = { 
            ...productData, 
            precio: parseFloat(productData.precio) || 0,
            impuesto_porcentaje: parseFloat(productData.impuesto_porcentaje) || 0 
        };

        try {
            const response = await fetch(isEditing ? `${apiBaseUrl}/${id}` : apiBaseUrl, {
                method: isEditing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(finalData),
            });

            if (!response.ok) {
                if (response.status === 401) { navigate('/login'); return; }
                const result = await response.json();
                throw new Error(result.message || "Error al guardar");
            }

            alert(`✅ Producto guardado.`);
            if (onSuccess) {
                onSuccess();
            } else if (window.opener) {
                window.opener.postMessage('listUpdated', '*');
                window.close();
            } else {
                navigate('/home/productos');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-shell">
            <form className="form-card" onSubmit={handleSubmit}>
                <header className="form-header">
                    <h2>{isEditing ? 'Editar Producto' : 'Registrar Producto'}</h2>
                    <p className="form-subtitle">Completa los datos para gestionar productos.</p>
                </header>

                {error && <div className="form-error">⚠️ {error}</div>}
                
                <div className="form-grid">
                    <label className="form-field">
                        <span>Código</span>
                        <input type="text" value={productData.codigo} onChange={(e) => setProductData({...productData, codigo: e.target.value})} required />
                    </label>
                    <label className="form-field">
                        <span>Nombre</span>
                        <input type="text" value={productData.nombre} onChange={(e) => setProductData({...productData, nombre: e.target.value})} required />
                    </label>
                </div>

                <div className="form-grid">
                    <label className="form-field">
                        <span>Precio Unitario ($)</span>
                        <input type="number" step="0.01" value={productData.precio} onChange={(e) => setProductData({...productData, precio: e.target.value})} required />
                    </label>
                    <label className="form-field">
                        <span>Impuesto (%)</span>
                        <input type="number" value={productData.impuesto_porcentaje} onChange={(e) => setProductData({...productData, impuesto_porcentaje: e.target.value})} />
                    </label>
                </div>

                <label className="form-field">
                    <span>Descripción</span>
                    <textarea value={productData.descripcion} onChange={(e) => setProductData({...productData, descripcion: e.target.value})} required />
                </label>

                <div className="form-actions">
                    <button type="button" className="btn ghost" onClick={onCancel || (() => window.close())}>Cancelar</button>
                    <button type="submit" className="btn primary" disabled={loading}>{loading ? 'Guardando...' : 'Guardar Producto'}</button>
                </div>
            </form>
        </div>
    ); 
};

export default ProductForm;