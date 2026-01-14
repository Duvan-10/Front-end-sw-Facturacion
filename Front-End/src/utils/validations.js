/**
 * Funciones de validación reutilizables para formularios
 */

// Expresiones regulares para validaciones
export const REGEX = {
    SOLO_NUMEROS: /^[0-9]+$/,
    SOLO_LETRAS: /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s.'-]*$/,
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    TELEFONO: /^[0-9\-\+\(\)]*$/,
    CODIGO_PRODUCTO: /^[a-zA-Z0-9\-_]*$/,
    DETALLE_PRODUCTO: /^[a-zA-Z0-9\s\-_áéíóúñ.,']*$/
};

/**
 * Valida si un identificacion es válido (solo números)
 */
export const esIdentificacionValida = (identificacion) => {
    return identificacion && REGEX.SOLO_NUMEROS.test(identificacion.trim());
};

/**
 * Valida si un nombre es válido (solo letras, espacios y puntos)
 */
export const esNombreValido = (nombre) => {
    return nombre && REGEX.SOLO_LETRAS.test(nombre.trim());
};

/**
 * Valida si un teléfono es válido
 */
export const esTelefonoValido = (telefono) => {
    return telefono && REGEX.TELEFONO.test(telefono.trim()) && telefono.trim().length >= 7;
};

/**
 * Valida si un email es válido
 */
export const esEmailValido = (email) => {
    return !email?.trim() || REGEX.EMAIL.test(email.trim());
};

/**
 * Valida si un código de producto es válido
 */
export const esCodigoValido = (codigo) => {
    return codigo && REGEX.CODIGO_PRODUCTO.test(codigo.trim());
};

/**
 * Valida si un detalle de producto es válido
 */
export const esDetalleValido = (detalle) => {
    return detalle && REGEX.DETALLE_PRODUCTO.test(detalle.trim());
};

/**
 * Valida si un valor unitario es válido
 */
export const esValorValido = (valor) => {
    const num = parseFloat(valor);
    return !isNaN(num) && num > 0;
};

/**
 * Mensaje de error para campo obligatorio
 */
export const getMensajeObligatorio = (nombreCampo) => {
    return `⚠️ ${nombreCampo} es obligatorio.`;
};

/**
 * Mensaje de error para caracteres inválidos
 */
export const getMensajeCaracteresInvalidos = (nombreCampo, permitidos = "") => {
    return `⚠️ ${nombreCampo}: contiene caracteres inválidos.${permitidos ? ` ${permitidos}` : ""}`;
};

/**
 * Mensaje de error para campo duplicado
 */
export const getMensajeDuplicado = (nombreCampo, valor) => {
    return `⚠️ ${nombreCampo} "${valor}" ya existe en el sistema.`;
};

/**
 * Valida si el detalle sigue el patrón 'nombre - descripción'
 */
export const esDetalleProductoValido = (detalle) => {
    return detalle && detalle.includes(' - ');
};

/**
 * Obtiene el mensaje de error para patrón de detalle incorrecto
 */
export const getMensajeDetalleProductoIncorrecto = (numeroProducto) => {
    return `⚠️ Producto ${numeroProducto}: El Detalle debe seguir el formato 'Nombre Producto - Descripción'\nEjemplo: Hormigas - Grandes`;
};

/**
 * Formatea un objeto de producto para guardar en BD
 * Divide el detalle en nombre (antes del -) y descripción (después del -)
 */
export const formatearProductoParaBD = (producto) => {
    // Validar que el detalle tenga el formato correcto
    if (!producto.detalle.includes(' - ')) {
        throw new Error(`Detalle inválido: debe seguir el formato 'Nombre - Descripción'`);
    }
    
    const [nombre, ...descParts] = producto.detalle.split(' - ');
    const nombreLimpio = nombre.trim();
    const descripcionLimpia = descParts.join(' - ').trim();
    
    if (!nombreLimpio) {
        throw new Error(`El nombre del producto no puede estar vacío`);
    }
    
    return {
        codigo: producto.codigo.trim(),
        nombre: nombreLimpio,
        precio: parseFloat(producto.vUnitario),
        impuesto_porcentaje: 19,
        descripcion: descripcionLimpia || "Sin detalles"
    };
};

/**
 * Formatea un objeto de cliente para guardar en BD
 */
export const formatearClienteParaBD = (cliente, identificacion) => {
    return {
        tipo_identificacion: cliente.tipo_identificacion,
        identificacion: identificacion.trim(),
        nombre_razon_social: cliente.nombre.trim(),
        email: cliente.correo?.trim() || null,
        telefono: cliente.telefono.trim(),
        direccion: cliente.direccion?.trim() || 'Sin dirección'
    };
};
