import React, { useState, useEffect } from 'react'; 
import axios from 'axios'; 
// Asegúrate de importar tu CSS si tienes un archivo de layout específico para Productos
// import './Productos.css'; 

const API_URL = 'http://localhost:3000/api/productos'; 
const ITEMS_PER_PAGE = 30; // Límite solicitado: 30 registros por página

function ProductCatalog() {
    // 1. Estados principales para datos y carga
    const [products, setProducts] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 2. Estados para Búsqueda y Paginación
    const [searchQuery, setSearchQuery] = useState(''); 
    const [currentPage, setCurrentPage] = useState(1); 
    const [totalItems, setTotalItems] = useState(0); 

    // 3. Estados para el formulario de Registro Superior
    const [formData, setFormData] = useState({
        id: null, // Para manejar la edición en el formulario superior (ya no se usa para edición en línea)
        codigo: '', 
        nombre: '', 
        descripcion: '', 
        precio: 0, 
        impuesto_porcentaje: 0, 
    });
    
    // 4. Estados de Control de UI
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false); // Sigue controlando el formulario superior

    // 🚨 NUEVOS ESTADOS PARA EDICIÓN EN LÍNEA
    const [editingRowId, setEditingRowId] = useState(null); // ID del producto editado en la tabla
    const [editingRowData, setEditingRowData] = useState({}); // Datos temporales de la fila en edición


    // =======================================================
    // I. CARGA DE DATOS CON BÚSQUEDA Y PAGINACIÓN (GET)
    // =======================================================
    const fetchProducts = async (page = currentPage, search = searchQuery) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error("Acceso denegado. Token no encontrado en la sesión.");
            }
            
            const params = {
                page: page,
                limit: ITEMS_PER_PAGE,
                search: search,
            };
            
            const response = await axios.get(API_URL, {
                headers: { Authorization: `Bearer ${token}` },
                params: params,
            });
            
            setProducts(response.data.data);
            setTotalItems(response.data.totalItems); 
            setError(null);
            setCurrentPage(page);
        
        } catch (err) {
            console.error("Error al cargar productos:", err);
            const message = err.response?.data?.message || "Error al cargar productos desde el servidor. ¿Token inválido o expirado?";
            setError(message);
            setProducts([]); 
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts(1, searchQuery); 
    }, [searchQuery]); 

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);


    // =======================================================
    // II. HANDLERS Y SUBMIT (Registro Superior)
    // =======================================================
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchProducts(newPage, searchQuery);
        }
    };

    const handleSearchChange = (e) => {
        setError(null);
        setSearchQuery(e.target.value);
        setCurrentPage(1); 
    };
    
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        // Manejo de números para precio e impuesto
        const newValue = (name === 'precio' || name === 'impuesto_porcentaje')
          ? (type === 'number' ? parseFloat(value) : value) 
          : value;
          
        setFormData({ ...formData, [name]: newValue });
    };
    
    const resetForm = () => {
        setFormData({ 
            id: null,
            codigo: '', 
            nombre: '', 
            descripcion: '', 
            precio: 0, 
            impuesto_porcentaje: 0 
        });
        setIsEditing(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        // Este submit solo se usa para el formulario superior (Registro nuevo)
        const method = isEditing ? 'put' : 'post';
        const url = isEditing ? `${API_URL}/${formData.id}` : API_URL;

        try {
            await axios({
                method: method,
                url: url,
                data: formData,
                headers: { Authorization: `Bearer ${token}` },
            });
            
            const action = isEditing ? 'actualizado' : 'registrado';
            alert(`Producto/Servicio ${formData.nombre} ${action} exitosamente.`);
            
            resetForm();
            setIsFormVisible(false); // Ocultar formulario después de guardar
            setSearchQuery(''); 
            fetchProducts(1, ''); // Recargar la lista desde la página 1
        } catch (err) {
            console.error("Error al guardar:", err);
            const message = err.response?.data?.message || 'Error al conectar con el servidor.';
            alert(`Fallo en la ${isEditing ? 'actualización' : 'registro'}: ${message}`);
        }
    };
    
    const handleToggleForm = () => {
        // Si el formulario superior está visible, al presionar, lo ocultamos y limpiamos
        if (isFormVisible) {
            resetForm();
        }
        // Aseguramos que la edición en línea esté cancelada cuando abrimos el formulario superior
        setEditingRowId(null); 
        setEditingRowData({}); 
        
        setIsFormVisible(!isFormVisible);
    };

    /* * La función handleEdit original ya no es necesaria, 
    * ya que ahora usamos handleStartRowEdit para la edición en línea.
    */


    // =======================================================
    // III. FUNCIONES PARA EDICIÓN EN LÍNEA (INLINE EDITING)
    // =======================================================

    // Inicia la edición en línea
    const handleStartRowEdit = (product) => {
        // 1. Guarda el ID de la fila que se está editando
        setEditingRowId(product.id);
        // 2. Crea una copia de los datos del producto en el estado temporal
        setEditingRowData(product); 
        // 3. Oculta el formulario de registro superior si está abierto
        setIsFormVisible(false);
        resetForm();
    };

    // Maneja los cambios en los inputs dentro de la fila de la tabla
    const handleRowChange = (e) => {
        const { name, value, type } = e.target;
        
        // Manejo de números para precio e impuesto
        const newValue = (name === 'precio' || name === 'impuesto_porcentaje')
          ? (type === 'number' ? parseFloat(value) : value) 
          : value;

        setEditingRowData(prevData => ({
            ...prevData,
            [name]: newValue
        }));
    };

    // Guarda la edición de la fila
    const handleSaveRow = async () => {
        const token = localStorage.getItem('token');
        const url = `${API_URL}/${editingRowData.id}`;

        try {
            await axios.put(url, editingRowData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            alert(`Producto ${editingRowData.nombre} actualizado exitosamente en línea.`);
            
            // Finaliza la edición
            setEditingRowId(null);
            setEditingRowData({});
            
            // Recargar la lista
            fetchProducts(currentPage, searchQuery);

        } catch (err) {
            console.error("Error al actualizar en línea:", err);
            const message = err.response?.data?.message || 'Error al conectar con el servidor.';
            alert(`Fallo en la actualización en línea: ${message}`);
        }
    };

    // Cancela la edición de la fila
    const handleCancelRowEdit = () => {
        setEditingRowId(null);
        setEditingRowData({});
    };


    // =======================================================
    // IV. RENDERIZADO
    // =======================================================

    return (
        <div className="products-container">
            <header className="module-header">Catálogo de Productos y Servicios</header>

            <h1 className="module-title">Gestión de Productos</h1>
            
            {/* --- 1 & 2. Controles de Búsqueda y Botón de Registro --- */}
            <section className="controls-section">
                <div className="search-bar">
                    <label htmlFor="search">Buscar Producto (Código o Nombre):</label>
                    <input 
                        type="text" 
                        id="search"
                        className="search-input" // Clase global
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Escriba aquí para búsqueda rápida..."
                    />
                </div>
                <button 
                    // Usamos las clases de global.css y la clase de estado
                    className={`btn ${isFormVisible ? 'btn-danger' : 'btn-primary'} btn-register-product`} 
                    onClick={handleToggleForm}
                >
                    {isFormVisible ? 'Cancelar Registro' : 'Registrar Nuevo Producto'}
                </button>
            </section>
            
            {/* --- Formulario de registro (Oculto/Visible) --- */}
            {isFormVisible && (
                <section className="form-section card">
                    <h2>Registrar Nuevo Producto/Servicio</h2>
                    <form onSubmit={handleSubmit} className="product-form">
                        
                        <label htmlFor="codigo">N° Código:</label>
                        <input type="text" name="codigo" value={formData.codigo} onChange={handleChange} required />
                        <label htmlFor="nombre">Nombre:</label>
                        <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
                        <label htmlFor="descripcion">Descripción:</label>
                        <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows="3" />
                        <label htmlFor="precio">Precio unitario:</label>
                        <input type="number" name="precio" min="0" step="0.01" value={formData.precio} onChange={handleChange} required />
                        <label htmlFor="impuesto_porcentaje">Impuesto (%):</label>
                        <input type="number" name="impuesto_porcentaje" min="0" max="100" step="0.01" value={formData.impuesto_porcentaje} onChange={handleChange} required />
                        
                        <button type="submit" className="btn btn-success">
                            Registrar Producto
                        </button>
                    </form>
                </section>
                )}
            
            <hr/>

            {/* --- 3. Listado de productos (Tabla y Paginación) --- */}
            <section className="list-section">
                <h2>Productos Registrados ({totalItems} en total)</h2>

                {loading && <p className="loading-message">Cargando lista desde el servidor...</p>}
                {error && <p className="error-message">{error}</p>}

                {!loading && products.length > 0 && (
                    <>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>N° Código</th>
                                    <th>Nombre</th>
                                    <th>Descripción</th>
                                    <th>Precio</th>
                                    <th>Impuesto (%)</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => {
                                    // 🚨 CLAVE: Determinar si esta fila es la que se está editando
                                    const isEditingRow = product.id === editingRowId;
                                    
                                    // Usamos los datos temporales si estamos editando, sino, usamos los datos originales
                                    const dataToRender = isEditingRow ? editingRowData : product;
                                    
                                    return (
                                        <tr key={product.id} className={isEditingRow ? 'editing-row' : ''}>
                                            {/* ID (#) - No editable */}
                                            <td>{product.id}</td> 
                                            
                                            {/* Código */}
                                            <td>
                                                {isEditingRow ? (
                                                    <input type="text" name="codigo" value={dataToRender.codigo} onChange={handleRowChange} className="inline-edit-input" required />
                                                ) : (
                                                    dataToRender.codigo
                                                )}
                                            </td>
                                            
                                            {/* Nombre */}
                                            <td>
                                                {isEditingRow ? (
                                                    <input type="text" name="nombre" value={dataToRender.nombre} onChange={handleRowChange} className="inline-edit-input" required />
                                                ) : (
                                                    dataToRender.nombre
                                                )}
                                            </td>
                                            
                                            {/* Descripción */}
                                            <td>
                                                {isEditingRow ? (
                                                    <textarea name="descripcion" value={dataToRender.descripcion} onChange={handleRowChange} className="inline-edit-input" rows="1" />
                                                ) : (
                                                    dataToRender.descripcion ? dataToRender.descripcion.substring(0, 50) + (dataToRender.descripcion.length > 50 ? '...' : '') : 'N/A'
                                                )}
                                            </td>
                                            
                                            {/* Precio */}
                                            <td>
                                                {isEditingRow ? (
                                                    <input type="number" name="precio" min="0" step="0.01" value={dataToRender.precio} onChange={handleRowChange} className="inline-edit-input" required />
                                                ) : (
                                                    `$${parseFloat(dataToRender.precio).toFixed(2)}`
                                                )}
                                            </td>
                                            
                                            {/* Impuesto (%) */}
                                            <td>
                                                {isEditingRow ? (
                                                    <input type="number" name="impuesto_porcentaje" min="0" max="100" step="0.01" value={dataToRender.impuesto_porcentaje} onChange={handleRowChange} className="inline-edit-input" required />
                                                ) : (
                                                    `${parseFloat(dataToRender.impuesto_porcentaje).toFixed(2)}%`
                                                )}
                                            </td>
                                            
                                            {/* Acciones */}
                                            <td className="actions-cell">
                                                {isEditingRow ? (
                                                    <>
                                                        <button className="btn btn-save-inline btn-success" onClick={handleSaveRow}>Guardar</button>
                                                        <button className="btn btn-danger btn-cancel-inline" onClick={handleCancelRowEdit}>Cancelar</button>
                                                    </>
                                                ) : (
                                                    // Desactivar el botón de Editar si otra fila está siendo editada
                                                    <button 
                                                        className="btn btn-edit" 
                                                        onClick={() => handleStartRowEdit(product)}
                                                        disabled={editingRowId !== null} // Se deshabilita si otra fila ya está abierta
                                                    >
                                                        Editar
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        
                        {/* --- Paginación --- */}
                        {totalPages > 1 && (
                            <div className="pagination-controls">
                                <button 
                                    onClick={() => handlePageChange(currentPage - 1)} 
                                    disabled={currentPage === 1}
                                    className="btn btn-pagination"
                                >
                                    Anterior
                                </button>
                                <span className="pagination-info">Página {currentPage} de {totalPages}</span>
                                <button 
                                    onClick={() => handlePageChange(currentPage + 1)} 
                                    disabled={currentPage === totalPages}
                                    className="btn btn-pagination"
                                >
                                    Siguiente
                                </button>
                            </div>
                        )}
                    </>
                )}
            </section>
        </div>
    );
}

export default ProductCatalog;