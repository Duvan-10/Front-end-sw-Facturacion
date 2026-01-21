/**
 * ===================================================================
 * FUNCIONES AUXILIARES PARA MANEJO DE TABLAS
 * ===================================================================
 * Utilidades para formateo, truncamiento y manipulación de datos
 * en tablas de Productos, Clientes y Facturas
 */

/**
 * Trunca texto largo y añade ellipsis
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima antes de truncar
 * @returns {string} Texto truncado con "..."
 */
export const truncateText = (text, maxLength = 30) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

/**
 * Renderiza celda de tabla con texto truncado y title para tooltip
 * @param {string} text - Texto completo
 * @param {number} maxLength - Longitud máxima
 * @returns {Object} Props para aplicar a <td>
 */
export const getTruncatedCellProps = (text, maxLength = 30) => {
    if (!text) return { children: '', title: '' };
    
    const shouldTruncate = text.length > maxLength;
    
    return {
        children: shouldTruncate ? truncateText(text, maxLength) : text,
        title: shouldTruncate ? text : '',
        className: shouldTruncate ? 'truncate-text' : ''
    };
};

/**
 * Formatea número como moneda colombiana
 * @param {number} amount - Monto a formatear
 * @returns {string} Monto formateado ($1.234.567)
 */
export const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '$0';
    return '$' + Math.round(amount).toLocaleString('es-CO');
};

/**
 * Formatea fecha en formato DD/MM/YYYY
 * @param {string} dateString - Fecha en formato ISO
 * @returns {string} Fecha formateada
 */
export const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
};

/**
 * Obtiene clase CSS según estado de factura
 * @param {string} estado - Estado de la factura
 * @returns {string} Clase CSS correspondiente
 */
export const getInvoiceStatusClass = (estado) => {
    const statusMap = {
        'Pagada': 'status-pagada',
        'Pendiente': 'status-pendiente',
        'Vencida': 'status-vencida',
        'Anulada': 'status-anulada',
        'Parcial': 'status-parcial'
    };
    return `invoice-status ${statusMap[estado] || ''}`;
};

/**
 * Obtiene clase CSS según estado de emisión
 * @param {string} estado - Estado de emisión
 * @returns {string} Clase CSS correspondiente
 */
export const getEmissionStatusClass = (estado) => {
    const emissionMap = {
        'Emitida': 'emision-emitida',
        'Pendiente': 'emision-pendiente',
        'Error': 'emision-error'
    };
    return `emision-status ${emissionMap[estado] || ''}`;
};

/**
 * Filtra array de objetos según término de búsqueda
 * @param {Array} items - Array de objetos a filtrar
 * @param {string} searchTerm - Término de búsqueda
 * @param {Array} searchFields - Campos en los que buscar
 * @returns {Array} Items filtrados
 */
export const filterTableData = (items, searchTerm, searchFields = []) => {
    if (!searchTerm || searchTerm.trim() === '') return items;
    
    const term = searchTerm.toLowerCase().trim();
    
    return items.filter(item => {
        return searchFields.some(field => {
            const value = getNestedValue(item, field);
            return value && String(value).toLowerCase().includes(term);
        });
    });
};

/**
 * Obtiene valor de propiedad anidada
 * @param {Object} obj - Objeto fuente
 * @param {string} path - Ruta de la propiedad (ej: "cliente.nombre")
 * @returns {*} Valor de la propiedad
 */
const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, prop) => 
        current?.[prop], obj
    );
};

/**
 * Ordena array de objetos por campo
 * @param {Array} items - Array a ordenar
 * @param {string} field - Campo por el que ordenar
 * @param {string} direction - 'asc' o 'desc'
 * @returns {Array} Array ordenado
 */
export const sortTableData = (items, field, direction = 'asc') => {
    return [...items].sort((a, b) => {
        const aVal = getNestedValue(a, field);
        const bVal = getNestedValue(b, field);
        
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return direction === 'asc' ? comparison : -comparison;
    });
};

/**
 * Normaliza identificación removiendo caracteres especiales
 * @param {string} identificacion - Identificación a normalizar
 * @returns {string} Identificación normalizada
 */
export const normalizeIdentification = (identificacion) => {
    if (!identificacion) return '';
    return identificacion.replace(/[\s.-]/g, '');
};

/**
 * Valida si el ancho de columna necesita ajuste según contenido
 * @param {string} content - Contenido de la celda
 * @param {number} threshold - Umbral de caracteres
 * @returns {boolean} True si necesita ajuste
 */
export const needsColumnResize = (content, threshold = 25) => {
    return content && content.length > threshold;
};

/**
 * Genera props completos para celdas de tabla responsive
 * @param {string} content - Contenido de la celda
 * @param {Object} options - Opciones de configuración
 * @returns {Object} Props para aplicar a <td>
 */
export const getResponsiveCellProps = (content, options = {}) => {
    const {
        maxLength = 30,
        formatter = null,
        className = ''
    } = options;
    
    let displayContent = content;
    
    // Aplicar formateador si existe
    if (formatter && typeof formatter === 'function') {
        displayContent = formatter(content);
    }
    
    // Verificar si necesita truncamiento
    const needsTruncation = displayContent && displayContent.length > maxLength;
    
    return {
        children: needsTruncation ? truncateText(displayContent, maxLength) : displayContent,
        title: needsTruncation ? displayContent : '',
        className: `${className} ${needsTruncation ? 'truncate-text' : ''}`.trim()
    };
};
