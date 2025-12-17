// Front-end/src/modules/Products/ProductForm.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import "../styles1.css"

const ProductForm = () => {
    const { id } = useParams();
    const isEditing = !!id; 

    // 🚨 CORRECCIÓN 1: Usar variable de entorno para portabilidad
    const apiBaseUrl = import.meta.env.VITE_API_URL 
        ? `${import.meta.env.VITE_API_URL}/productos` 
        : 'http://localhost:8080/api/productos'; 
    
    // 🚨 CORRECCIÓN 2: Cambiar sessionStorage a localStorage
    const getAuthToken = () => {
        return localStorage.getItem('authToken'); 
    };
    
    const [productData, setProductData] = useState({
        codigo: '',
        nombre: '',
        precio: '',
        descripcion: '', 
        impuesto_porcentaje: '0', 
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isEditing) {
            const fetchProductData = async () => {
                const token = getAuthToken();
                if (!token) {
                    setError("Error de autenticación: Token no encontrado.");
                    return;
                }
                setLoading(true);
                try {
                    const response = await fetch(`${apiBaseUrl}/${id}`, {
                        method: 'GET',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    
                    if (!response.ok) throw new Error(`No se pudo cargar el producto.`);
                    
                    const result = await response.json();
                    // Ajuste según estructura común de respuesta { data: {...} }
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
    }, [isEditing, id, apiBaseUrl]); 

    const handleChange = (e) => {
        const { id, value } = e.target;
        setProductData(prev => ({ ...prev, [id]: value }));
    };
    
    const handleCloseTab = () => window.close();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        
        const token = getAuthToken();
        if (!token) {
            alert("Su sesión ha expirado. Inicie sesión nuevamente.");
            setLoading(false);
            return;
        }

        const finalData = { 
            codigo: productData.codigo,
            nombre: productData.nombre,
            descripcion: productData.descripcion,
            precio: parseFloat(productData.precio) || 0,
            impuesto_porcentaje: parseFloat(productData.impuesto_porcentaje) || 0,
        };

        // 🚨 CORRECCIÓN 3: Asegurar URL y Método correctos
        const url = isEditing ? `${apiBaseUrl}/${id}` : apiBaseUrl;
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(finalData),
            });

            const result = await response.json();

            if (!response.ok) {
                // Manejo de errores de duplicidad o validación del servidor
                const serverMsg = result.message || "Error en el servidor";
                if (response.status === 409 || serverMsg.includes("duplicate")) {
                    throw new Error("El código ya existe en otro producto.");
                }
                throw new Error(serverMsg);
            }

            alert(`✅ Producto guardado correctamente.`);
            
            if (window.opener) {
                window.opener.postMessage('listUpdated', '*'); 
            }
            handleCloseTab(); 

        } catch (err) {
            setError(err.message);
            alert(`❌ ${err.message}`); 
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditing) return <div className="card">Cargando datos del producto...</div>;

    return ( 
        <form className="app-form card" onSubmit={handleSubmit}>
            <h2 className="module-title">
                {isEditing ? `Editar Producto` : 'Registrar Nuevo Producto'}
            </h2>
            
            {error && <p className="error-message">{error}</p>}
            
            <div className="section-group client-data">
                <div className="field-col">
                    <label htmlFor="codigo">Código</label>
                    <input type="text" id="codigo" value={productData.codigo} onChange={handleChange} required />
                </div>
                
                <div className="field-col">
                    <label htmlFor="nombre">Nombre</label>
                    <input type="text" id="nombre" value={productData.nombre} onChange={handleChange} required />
                </div>

                <div className="field-col">
                    <label htmlFor="precio">Precio Unitario ($)</label>
                    <input type="number" id="precio" step="0.01" value={productData.precio} onChange={handleChange} required />
                </div>
                
                <div className="field-col">
                    <label htmlFor="impuesto_porcentaje">Impuesto (%)</label>
                    <input type="number" id="impuesto_porcentaje" value={productData.impuesto_porcentaje} onChange={handleChange} />
                </div>
                
                <div className="field-col full-width">
                    <label htmlFor="descripcion">Descripción</label>
                    <textarea id="descripcion" value={productData.descripcion} onChange={handleChange} rows="3" />
                </div>
            </div>

            <div className="final-buttons-group">
                <button type="submit" className="btn btn-success" disabled={loading}>
                    {loading ? 'Guardando...' : 'Guardar'}
                </button>
                <button type="button" className="btn btn-danger" onClick={handleCloseTab}>
                    Cancelar
                </button>
            </div>
        </form>
    ); 
};

export default ProductForm;