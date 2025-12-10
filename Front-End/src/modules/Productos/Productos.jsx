import React, { useState, useEffect } from 'react'; 
import axios from 'axios'; 

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

  // 3. Estados para el formulario (Registro/Edición)
  const [formData, setFormData] = useState({
    id: null, // Para manejar la edición
    codigo: '', 
    nombre: '', 
    descripcion: '', 
    precio: 0, 
    impuesto_porcentaje: 0, 
  });
  
  // 4. Estados de Control de UI
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);


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
  // II. HANDLERS Y SUBMIT
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
        // Si el formulario está visible, al presionar, lo ocultamos y limpiamos
        if (isFormVisible) {
            resetForm();
        }
        setIsFormVisible(!isFormVisible);
    };
    
    const handleEdit = (product) => {
        // Al editar, cargamos los datos del producto en el formulario
        setFormData(product); 
        setIsEditing(true);
        setIsFormVisible(true);
    };


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
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Escriba aquí para búsque..."
          />
        </div>
        <button 
            className="btn btn-success btn-register-product" 
            onClick={handleToggleForm}
        >
            {isFormVisible ? 'Ocultar Formulario' : 'Registrar Nuevo Producto'}
        </button>
      </section>
      
      {/* --- Formulario de registro (Oculto/Visible) --- */}
      {isFormVisible && (
        <section className="form-section card">
            <h2>{isEditing ? 'Editar Producto' : 'Registrar Nuevo Producto/Servicio'}</h2>
            <form onSubmit={handleSubmit} className="product-form">
                
                {/* ID oculto para edición */}
                {isEditing && <input type="hidden" name="id" value={formData.id || ''} />}
                
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
                
                <button type="submit" className="btn btn-primary">
                    {isEditing ? 'Guardar Cambios' : 'Registrar Producto'}
                </button>
            </form>
        </section>
        )}
      
      <hr/>

      {/* --- 3. Listado de productos (Tabla y Paginación) --- */}
      <section className="list-section">
        <h2>Productos Registrados ({totalItems} en total)</h2>

        {loading && <p>Cargando lista desde el servidor...</p>}
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
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.codigo}</td>
                    <td>{product.nombre}</td>
                    <td>{product.descripcion ? product.descripcion.substring(0, 50) + (product.descripcion.length > 50 ? '...' : '') : 'N/A'}</td>
                    <td>${parseFloat(product.precio).toFixed(2)}</td>
                    <td>{parseFloat(product.impuesto_porcentaje).toFixed(2)}%</td>
                    <td>
                      <button className="btn btn-edit" onClick={() => handleEdit(product)}>Editar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* --- Paginación --- */}
            {totalPages > 1 && (
                <div className="pagination-controls">
                    <button 
                        onClick={() => handlePageChange(currentPage - 1)} 
                        disabled={currentPage === 1}
                        className="btn"
                    >
                        Anterior
                    </button>
                    <span>Página {currentPage} de {totalPages}</span>
                    <button 
                        onClick={() => handlePageChange(currentPage + 1)} 
                        disabled={currentPage === totalPages}
                        className="btn"
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