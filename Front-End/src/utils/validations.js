/**
 * Funciones de validación reutilizables para formularios
 */

/**
 * Normaliza el tipo de identificación desde BD al formato abreviado del frontend
 */
export const normalizarTipoIdentificacion = (tipoDesdeDB) => {
    const clave = (tipoDesdeDB || '').trim();
    const claveUpper = clave.toUpperCase();
    const mapeoReverso = {
        'Cédula de Ciudadanía': 'C.C.',
        'CEDULA DE CIUDADANIA': 'C.C.',
        'NIT': 'NIT',
        'Cédula de Extranjería': 'C.E.',
        'CEDULA DE EXTRANJERIA': 'C.E.',
        'C.C.': 'C.C.',
        'C.E.': 'C.E.'
    };

    if (mapeoReverso[clave]) return mapeoReverso[clave];
    if (mapeoReverso[claveUpper]) return mapeoReverso[claveUpper];
    if (claveUpper.includes('NIT')) return 'NIT';
    if (claveUpper.includes('EXTRAN')) return 'C.E.';
    if (claveUpper.includes('CIUDA') || claveUpper.includes('CEDULA')) return 'C.C.';
    return 'C.C.';
};

/**
 * Expande el tipo de identificación abreviado a nombre completo
 */
export const expandirTipoIdentificacion = (tipoAbreviado) => {
    const mapeo = {
        'C.C.': 'Cédula de Ciudadanía',
        'NIT': 'NIT',
        'C.E.': 'Cédula de Extranjería'
    };
    return mapeo[tipoAbreviado] || tipoAbreviado;
};

/**
 * Valida identificación según el tipo de documento
 */
export const validarIdentificacionPorTipo = (identificacion, tipoDoc) => {
    const id = identificacion.trim();
    const soloDigitos = id.replace(/[^0-9]/g, '');

    switch(tipoDoc) {
        case 'C.C.':
            // Cédula: exactamente 10 dígitos
            return /^\d{10}$/.test(soloDigitos);

        case 'C.E.':
            // Cédula de Extranjería: exactamente 10 dígitos
            return /^\d{10}$/.test(soloDigitos);

        case 'NIT': {
            // NIT: un guion obligatorio antes del dígito verificador, máximo 12 caracteres totales
            // Ejemplos válidos: 900123456-7, 1234567-8
            const patronNit = /^\d{6,11}-\d$/; // parte inicial 6-11 dígitos + '-' + dígito verificador
            return patronNit.test(id) && id.length <= 12;
        }

        default:
            return soloDigitos.length >= 6 && soloDigitos.length <= 12;
    }
};

/**
 * Obtiene el mensaje de error específico por tipo de documento
 */
export const getMensajeErrorIdentificacion = (tipoDoc) => {
    switch(tipoDoc) {
        case 'C.C.':
            return '⚠️ Cédula: debe contener exactamente 10 dígitos';
        case 'C.E.':
            return '⚠️ Cédula de Extranjería: debe contener exactamente 10 dígitos';
        case 'NIT':
            return '⚠️ NIT: debe tener un guion antes del dígito verificador y máximo 12 caracteres (ej: 900123456-7)';
        default:
            return '⚠️ Identificación: formato inválido';
    }
};

// Expresiones regulares para validaciones
export const REGEX = {
    SOLO_NUMEROS: /^[0-9]+$/,
    IDENTIFICACION: /^[0-9\s.-]+$/, // Números, espacios, puntos y guiones para NIT/CE
    SOLO_LETRAS: /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s.'-]*$/,
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    TELEFONO: /^[0-9\-\+\(\)]*$/,
    CODIGO_PRODUCTO: /^[a-zA-Z0-9\-_]*$/,
    DETALLE_PRODUCTO: /^[a-zA-Z0-9\s\-_áéíóúñ.,']*$/
};

/**
 * Valida si una identificación es válida (permite números, espacios, puntos y guiones)
 */
export const esIdentificacionValida = (identificacion) => {
    return identificacion && REGEX.IDENTIFICACION.test(identificacion.trim());
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
        tipo_identificacion: expandirTipoIdentificacion(cliente.tipo_identificacion),
        identificacion: identificacion.trim(),
        nombre_razon_social: cliente.nombre.trim(),
        email: cliente.correo?.trim() || null,
        telefono: cliente.telefono.trim(),
        direccion: cliente.direccion?.trim() || 'Sin dirección'
    };
};
