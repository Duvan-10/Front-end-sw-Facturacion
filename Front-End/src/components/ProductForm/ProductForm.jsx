import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import "../styles1.css"

// =======================================================
// COMPONENTE: ProductForm 
// =======================================================

const ProductForm = () => {
    
    const { id } = useParams();
    const isEditing = !!id; // True si estamos en /productos/editar/:id

    // 🚨 1. Referencias para implementar la regla de solo lectura en edición
    const taxInputRef = useRef(null); 
    const codeInputRef = useRef(null);

    // URL base de la API (AJUSTA ESTO SI ES NECESARIO)
    const apiBaseUrl = 'http://localhost:8080/api/productos'; 
    
    // 🚨 CORRECCIÓN DE SEGURIDAD: Leer el token de sessionStorage
    // Esto asegura que la sesión se cierra automáticamente al cerrar el navegador.
    const getAuthToken = () => {
        return sessionStorage.getItem('authToken'); 
    };
    
    // Estado inicial
    const [productData, setProductData] = useState({
        codigo: '',
        nombre: '',
        precio: '',
        descripcion: '', 
        impuesto_porcentaje: '0', 
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- I. LÓGICA DE CARGA POR URL (fetch GET individual para edición) ---
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
                        headers: {
                            'Authorization': `Bearer ${token}` 
                        }
                    });
                    
                    if (response.status === 401) throw new Error("Acceso denegado. Token inválido o expirado.");
                    if (!response.ok) throw new Error(`No se pudo cargar el producto ${id}. Código: ${response.status}`);
                    
                    const data = await response.json();
                    
                    setProductData({
                        codigo: data.codigo || '',
                        nombre: data.nombre || '',
                        precio: data.precio ? String(data.precio) : '', 
                        descripcion: data.descripcion || '',
                        impuesto_porcentaje: data.impuesto_porcentaje ? String(data.impuesto_porcentaje) : '0',
                    });
                } catch (err) {
                    console.error("Error al cargar datos:", err);
                    setError(err.message);
                    alert(`Error al cargar datos del producto: ${err.message}`);
                } finally {
                    setLoading(false);
                }
            };
            fetchProductData();
        }
    }, [isEditing, id]); 

    // Handler genérico
    const handleChange = (e) => {
        const { id, value } = e.target;
        setProductData(prev => ({
            ...prev,
            [id]: value
        }));
    };
    
    // Handler para alertar si se intenta editar el impuesto (solo lectura en edición)
    const handleTaxFocus = () => {
        if (isEditing) {
            alert("⚠️ El porcentaje de impuesto solo puede modificarse al crear un nuevo producto.");
            if (taxInputRef.current) {
                taxInputRef.current.blur(); 
            }
        }
    };

    // Handler para alertar si se intenta editar el código (solo lectura en edición)
    const handleCodeFocus = () => {
        if (isEditing) {
            alert("⚠️ El código de producto no puede ser modificado una vez que el producto ha sido registrado.");
            if (codeInputRef.current) {
                codeInputRef.current.blur();
            }
        }
    };

    const handleCloseTab = () => {
        window.close();
    };

    // --- II. HANDLER DE ENVÍO (POST/PUT) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        
        const token = getAuthToken();
        if (!token) {
            alert("Error de autenticación: No hay token disponible.");
            setLoading(false);
            return;
        }

        let url = apiBaseUrl;
        let method = 'POST';
        
        // Preparar datos, asegurando que los números son números (usamos parseFloat)
        const finalData = { 
            codigo: productData.codigo,
            nombre: productData.nombre,
            descripcion: productData.descripcion,
            precio: parseFloat(productData.precio) || 0,
            impuesto_porcentaje: parseFloat(productData.impuesto_porcentaje) || 0,
        };
        
        if (isEditing) {
            url = `${apiBaseUrl}/${id}`;
            method = 'PUT';
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(finalData),
            });

            if (response.status === 401) throw new Error("Acceso denegado. Token inválido o expirado.");
            if (!response.ok) {
                const errorBody = await response.json(); 
                throw new Error(errorBody.message || `Error ${response.status}: Error al procesar la solicitud.`);
            }

            const action = isEditing ? 'editó' : 'registró';
            alert(`✅ Producto "${productData.nombre}" ${action} con éxito.`);
            
            if (window.opener) {
                window.opener.postMessage('listUpdated', '*'); 
            }

            handleCloseTab(); 

        } catch (err) {
            console.error("Error al guardar producto:", err);
            setError(err.message);
            alert(`❌ Error al guardar el producto: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditing) {
        return <div className="loading-card card" style={{ padding: '20px', textAlign: 'center' }}>Cargando datos del producto...</div>;
    }

    if (error && isEditing) {
        return <div className="error-card card" style={{ padding: '20px', color: 'red', textAlign: 'center' }}>Error: {error}</div>;
    }

    return ( 
        <form className="app-form card" onSubmit={handleSubmit}>
            <h2 className="module-title" style={{ textAlign: 'center' }}>
                {isEditing ? `Editar Producto #${id}` : 'Registrar Nuevo Producto'}
            </h2>
            
            <div className="section-group client-data">
                
                {/* Código (SOLO LECTURA EN EDICIÓN) */}
                <div className="field-col">
                    <label htmlFor="codigo">Código</label>
                    <input 
                        type="text" 
                        id="codigo" 
                        placeholder="Código de Referencia" 
                        value={productData.codigo} 
                        onChange={handleChange} 
                        required
                        readOnly={isEditing} 
                        ref={codeInputRef}
                        onFocus={handleCodeFocus}
                        className={isEditing ? 'read-only-field' : ''}
                    />
                </div>
                
                {/* Nombre */}
                <div className="field-col">
                    <label htmlFor="nombre">Nombre</label>
                    <input 
                        type="text" 
                        id="nombre" 
                        placeholder="Nombre completo del Producto" 
                        value={productData.nombre} 
                        onChange={handleChange} 
                        required 
                    />
                </div>

                {/* Precio */}
                <div className="field-col">
                    <label htmlFor="precio">Precio Unitario ($)</label>
                    <input 
                        type="number" 
                        id="precio" 
                        placeholder="0.00" 
                        step="0.01"
                        min="0"
                        value={productData.precio} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                
                {/* Impuesto: SOLO LECTURA EN EDICIÓN */}
                <div className="field-col">
                    <label htmlFor="impuesto_porcentaje">Impuesto (%)</label>
                    <input 
                        type="number" 
                        id="impuesto_porcentaje" 
                        placeholder="0" 
                        step="1"
                        min="0"
                        value={productData.impuesto_porcentaje} 
                        onChange={handleChange}
                        readOnly={isEditing} 
                        ref={taxInputRef} 
                        onFocus={handleTaxFocus} 
                        className={isEditing ? 'read-only-field' : ''}
                    />
                </div>
                
                {/* Descripción */}
                <div className="field-col full-width">
                    <label htmlFor="descripcion">Descripción</label>
                    <textarea 
                        id="descripcion" 
                        placeholder="Detalles del producto" 
                        value={productData.descripcion} 
                        onChange={handleChange} 
                        rows="3" 
                    />
                </div>

            </div>

            {/* Botones de Acción */}
            <div className="final-buttons-group">
                <button 
                    type="submit" 
                    className="btn btn-success" 
                    style={{ width: '200px' }}
                    disabled={loading}
                >
                    {loading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Registrar Producto')}
                </button>
                
                <button 
                    type="button" 
                    className="btn btn-danger" 
                    onClick={handleCloseTab} 
                    style={{ width: '200px' }}
                    disabled={loading}
                >
                    Cerrar Pestaña
                </button>
            </div>
        </form>
    ); 
};

export default ProductForm;