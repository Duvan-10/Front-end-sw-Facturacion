import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../api';
import "../Froms.css"


const ProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
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
            if (window.opener) {
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
        <div className="form-container">
            <form className="card" onSubmit={handleSubmit}>
                <h2 className="module-title">{isEditing ? 'Editar Producto' : 'Registrar Producto'}</h2>
                {error && <div className="error-banner">⚠️ {error}</div>}
                
                <div className="section-group">
                    <div className="field-col">
                        <label>Código</label>
                        <input type="text" value={productData.codigo} onChange={(e) => setProductData({...productData, codigo: e.target.value})} required />
                    </div>
                    <div className="field-col">
                        <label>Nombre</label>
                        <input type="text" value={productData.nombre} onChange={(e) => setProductData({...productData, nombre: e.target.value})} required />
                    </div>
                </div>

                <div className="section-group">
                    <div className="field-col full-width">
                        <label>Descripción</label>
                        <textarea value={productData.descripcion} onChange={(e) => setProductData({...productData, descripcion: e.target.value})} required />
                    </div>
                </div>

                <div className="section-group">
                    <div className="field-col">
                        <label>Precio Unitario ($)</label>
                        <input type="number" step="0.01" value={productData.precio} onChange={(e) => setProductData({...productData, precio: e.target.value})} required />
                    </div>
                    <div className="field-col">
                        <label>Impuesto (%)</label>
                        <input type="number" value={productData.impuesto_porcentaje} onChange={(e) => setProductData({...productData, impuesto_porcentaje: e.target.value})} />
                    </div>
                </div>

                <div className="btn-group">
                    <button type="button" className="btn btn-secondary" onClick={() => window.close()}>Cancelar</button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Guardando...' : 'Guardar Producto'}</button>
                </div>
            </form>
        </div>
    ); 
};

export default ProductForm;