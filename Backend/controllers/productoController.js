import db from '../config/db.config.js';

// 1. Obtener todos los productos
export const getAllProductos = async (req, res) => {
    const search = req.query.search || '';
    try {
        const [rows] = await db.query(
            "SELECT * FROM productos WHERE nombre LIKE ? OR codigo LIKE ? ORDER BY id DESC",
            [`%${search}%`, `%${search}%`]
        );
        res.json({ data: rows });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener productos", error: error.message });
    }
};

// 2. Obtener producto por ID
export const getProductoById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query("SELECT * FROM productos WHERE id = ?", [id]);
        if (rows.length === 0) return res.status(404).json({ message: "Producto no encontrado" });
        res.json({ data: rows[0] });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el producto" });
    }
};

// 3. Crear nuevo producto
export const createProducto = async (req, res) => {
    const { codigo, nombre, precio, impuesto_porcentaje, descripcion } = req.body;

    // 🚨 VALIDACIÓN: Bloquear negativos y campos vacíos críticos
    if (!codigo || !nombre || precio < 0) {
        return res.status(400).json({ 
            message: precio < 0 ? "El precio no puede ser negativo" : "Código y Nombre son obligatorios" 
        });
    }

    // 📝 Manejo de descripción vacía
    const descripcionFinal = descripcion?.trim() === "" ? "Sin detalles" : descripcion;

    try {
        const [result] = await db.query(
            "INSERT INTO productos (codigo, nombre, precio, impuesto_porcentaje, descripcion) VALUES (?, ?, ?, ?, ?)",
            [codigo, nombre, precio, impuesto_porcentaje, descripcionFinal]
        );
        res.status(201).json({ message: "Producto creado", id: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: "El código ya existe" });
        res.status(500).json({ message: "Error al crear producto" });
    }
};

// 4. ACTUALIZAR PRODUCTO
export const updateProducto = async (req, res) => {
    const { id } = req.params;
    const { codigo, nombre, precio, impuesto_porcentaje, descripcion } = req.body;

    // 🚨 VALIDACIÓN: Bloquear negativos y asegurar datos mínimos
    if (precio < 0) {
        return res.status(400).json({ message: "Operación cancelada: El precio no puede ser negativo." });
    }
    if (!nombre || !codigo) {
        return res.status(400).json({ message: "El nombre y el código no pueden estar vacíos." });
    }

    // 📝 Si la descripción viene vacía, le damos un valor por defecto para que no quede "null"
    const descripcionFinal = (descripcion === null || descripcion === undefined || descripcion.trim() === "") 
        ? "Sin detalles" 
        : descripcion;

    try {
        const query = `
            UPDATE productos 
            SET codigo = ?, nombre = ?, precio = ?, impuesto_porcentaje = ?, descripcion = ? 
            WHERE id = ?
        `;
        const [result] = await db.query(query, [codigo, nombre, precio, impuesto_porcentaje, descripcionFinal, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "No se encontró el producto para actualizar" });
        }

        res.json({ message: "Producto actualizado correctamente" });
    } catch (error) {
        console.error("Error en updateProducto:", error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: "El nuevo código ya está en uso por otro producto" });
        }
        res.status(500).json({ message: "Error interno al actualizar el producto" });
    }
};

// 6. ELIMINAR PRODUCTO (SOLO ADMIN)
export const deleteProducto = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Validar que el solicitante sea admin
        const [userRows] = await db.query('SELECT role FROM users WHERE id = ?', [req.user.id]);
        if (!userRows.length || userRows[0].role !== 'admin') {
            return res.status(403).json({ message: 'Acceso denegado. Solo administradores pueden eliminar productos.' });
        }

        // 2. Intentar eliminar (manejar FK con detalles de factura)
        try {
            const [result] = await db.query('DELETE FROM productos WHERE id = ?', [id]);
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Producto no encontrado.' });
            }
        } catch (error) {
            if (error.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(409).json({ message: 'No se puede eliminar: el producto tiene facturas asociadas.' });
            }
            throw error;
        }

        return res.status(200).json({ message: 'Producto eliminado correctamente.' });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};
// 5. BUSCAR PRODUCTO POR CÓDIGO (NUEVO: Para auto-relleno en Factura)
// ------------------------------------------------------------------
export const getProductoByCodigo = async (req, res) => {
    const { codigo } = req.params; 
    try {
        // 1. Agregamos 'descripcion' a la consulta y usamos CONCAT para crear el detalle combinado
        const [rows] = await db.query(
            `SELECT id, codigo, nombre, precio, impuesto_porcentaje, descripcion,
             CONCAT(nombre, ' - ', descripcion) AS detalle_completo 
             FROM productos WHERE codigo = ? LIMIT 1`,
            [codigo]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        const producto = rows[0];

        // 2. Formateamos la respuesta para que el Frontend la entienda sin errores
        res.json({
            id: producto.id,
            codigo: producto.codigo,
            precio: producto.precio,
            impuesto_porcentaje: producto.impuesto_porcentaje,
            // Enviamos el detalle combinado en la propiedad 'descripcion' 
            // que es la que tu Frontend está buscando para llenar el campo 'detail'
            descripcion: producto.detalle_completo 
        });

    } catch (error) {
        console.error("Error al buscar producto por código:", error);
        res.status(500).json({ message: "Error interno en el servidor al buscar el producto" });
    }
};