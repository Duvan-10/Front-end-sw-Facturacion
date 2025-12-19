import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import "../styles1.css"

const ProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id; 

    const apiBaseUrl = import.meta.env.VITE_API_URL 
        ? `${import.meta.env.VITE_API_URL}/productos` 
        : 'http://localhost:8080/api/productos'; 
    
    const getAuthToken = () => sessionStorage.getItem('authToken');
    
    const [productData, setProductData] = useState({
        codigo: '', nombre: '', precio: '', descripcion: '', impuesto_porcentaje: '0', 
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = getAuthToken();
        if (!token) {
            navigate('/');
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
                        sessionStorage.removeItem('authToken');
                        navigate('/');
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
        if (!token) { navigate('/'); return; }

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
                if (response.status === 401) { navigate('/'); return; }
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
        <form className="app-form card" onSubmit={handleSubmit}>
            <h2 className="module-title">{isEditing ? `Editar Producto` : 'Registrar Producto'}</h2>
            {error && <p className="error-message">⚠️ {error}</p>}
            <div className="section-group client-data">

                <div className="field-col">
                    <label>Código</label>
                    <input type="text" id="codigo" value={productData.codigo} onChange={(e) => setProductData({...productData, codigo: e.target.value})} required />
                </div>
                <div className="field-col">
                    <label>Nombre</label>
                    <input type="text" id="nombre" value={productData.nombre} onChange={(e) => setProductData({...productData, nombre: e.target.value})} required />
<br></br>
<br></br>
                    
                <div className="input-especial">
                <label>Descripcion </label>
                <input type="text, number" step="nombre" value={productData.descripcion} onChange={(e) => setProductData({...productData, descripcion: e.target.value})} required />
                </div>


                </div>
                <div className="field-col">
                    <label>Precio Unitario ($)</label>
                    <input type="number" step="0.01" value={productData.precio} onChange={(e) => setProductData({...productData, precio: e.target.value})} required />
                </div>
                <div className="field-col">
                    <label>Impuesto (%)</label>
                    <input type="number" value={productData.impuesto_porcentaje} onChange={(e) => setProductData({...productData, impuesto_porcentaje: e.target.value})} />
                </div>
                


            </div>
            <div className="final-buttons-group">
                <button type="submit" className="btn btn-success" disabled={loading}>{loading ? '...' : 'Guardar'}</button>
                <button type="button" className="btn btn-danger" onClick={() => window.close()}>Cancelar</button>
            </div>
        </form>
    ); 
};

export default ProductForm;