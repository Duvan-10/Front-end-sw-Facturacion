// Backend/controllers/productoController.js

import db from '../models/db.js';

// Backend/controllers/productoController.js (SOLO LA FUNCIÓN getAllProductos CORREGIDA)

// =======================================================
// 1. OBTENER PRODUCTOS (GET) CON BÚSQUEDA, PAGINACIÓN (30) Y ORDENAMIENTO (MÁS RECIENTE)
// =======================================================
export const getAllProductos = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    try {
        let whereClause = '';
        let searchParams = []; 
        
        if (search) {
            // Permite buscar por código o nombre
            whereClause = `WHERE codigo LIKE ? OR nombre LIKE ?`;
            searchParams.push(`%${search}%`, `%${search}%`); 
        }

        // Obtener el total de productos para la paginación
        // 🚨 CORRECCIÓN DE ESPACIOS en COUNT QUERY
        let countQuery = `SELECT COUNT(*) as total FROM productos ${whereClause}`;
        let [countResult] = await db.execute(countQuery, searchParams.length > 0 ? searchParams : []); 
        const totalItems = countResult[0].total;

        // Consulta de datos. Ordenamos por ID DESC (más reciente)
        // 🚨 CORRECCIÓN DE ESPACIOS en DATA QUERY (eliminando el exceso de newlines y tabs)
        const dataQuery = `
            SELECT id, codigo, nombre, descripcion, precio, impuesto_porcentaje, created_at
            FROM productos
            ${whereClause}
            ORDER BY id DESC    
            LIMIT ${Number(limit)} OFFSET ${Number(offset)}
        `.trim().replace(/\s+/g, ' '); // 🚨 Añadimos .trim() y reemplazo de espacios múltiples

        const queryParams = searchParams.length > 0 ? searchParams : [];
        
        const [rows] = await db.execute(dataQuery, queryParams);
        
        res.status(200).json({
            data: rows,
            totalItems: totalItems,
            currentPage: page,
            itemsPerPage: limit
        });

    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ message: "Error al obtener la lista de productos." });
    }
};

// Backend/controllers/productoController.js (SOLO LA FUNCIÓN createProducto CORREGIDA)

// =======================================================
// 2. REGISTRAR NUEVO PRODUCTO (POST) <-- 🚨 CORREGIDA LA SINTAXIS SQL
// =======================================================
export const createProducto = async (req, res) => {
    const { codigo, nombre, descripcion, precio, impuesto_porcentaje } = req.body;

    if (!codigo || !nombre || precio === undefined) {
        return res.status(400).json({ message: "Código, nombre y precio son requeridos." });
    }

    try {
        // 🚨 CORRECCIÓN: Limpiando la cadena SQL
        const query = `
            INSERT INTO productos (codigo, nombre, descripcion, precio, impuesto_porcentaje)
            VALUES (?, ?, ?, ?, ?)
        `.trim().replace(/\s+/g, ' '); // <-- 🚨 Aplicando limpieza
        
        // created_at se asigna automáticamente por la base de datos
        const [result] = await db.execute(query, [
            codigo, 
            nombre, 
            descripcion || null, 
            precio, 
            impuesto_porcentaje || 0
        ]);

        res.status(201).json({ 
            message: "Producto registrado exitosamente.", 
            productoId: result.insertId 
        });
    } catch (error) {
        console.error("Error al registrar producto:", error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: "El código de producto ya existe." });
        }
        // Retorna un mensaje genérico al cliente
        res.status(500).json({ message: "Error interno al registrar el producto." });
    }
};
// =======================================================
// 3. ACTUALIZAR PRODUCTO (PUT) <-- 🚨 CORREGIDA LA SINTAXIS SQL
// =======================================================
export const updateProducto = async (req, res) => {
    const { id } = req.params;
    const { codigo, nombre, descripcion, precio, impuesto_porcentaje } = req.body;

    if (!codigo || !nombre || precio === undefined) {
        return res.status(400).json({ message: "Código, nombre y precio son requeridos para la actualización." });
    }

    try {
        // 🚨 CORRECCIÓN: Limpiando la cadena SQL
        const query = `
            UPDATE productos 
            SET codigo = ?, nombre = ?, descripcion = ?, precio = ?, impuesto_porcentaje = ? 
            WHERE id = ?
        `.trim().replace(/\s+/g, ' '); // <-- 🚨 Aplicando limpieza
        
        const [result] = await db.execute(query, [
            codigo, 
            nombre, 
            descripcion || null, 
            precio, 
            impuesto_porcentaje || 0,
            id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Producto no encontrado o no se hicieron cambios." });
        }

        res.status(200).json({ message: "Producto actualizado exitosamente." });
    } catch (error) {
        console.error("Error al actualizar producto:", error);
         if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: "El código de producto ya existe en otro registro." });
        }
        // Retorna un mensaje genérico al cliente (el error detallado está en la consola del servidor)
        res.status(500).json({ message: "Error interno al actualizar el producto." });
    }
};

// =======================================================
// 4. OBTENER PRODUCTO POR ID (GET /:id) 
// =======================================================
export const getProductoById = async (req, res) => {
    const { id } = req.params;

    try {
        // 🚨 CORRECCIÓN: Limpiando la cadena SQL para evitar el error 500
        const query = `
            SELECT id, codigo, nombre, descripcion, precio, impuesto_porcentaje
            FROM productos 
            WHERE id = ?
        `.trim().replace(/\s+/g, ' '); // <-- 🚨 Aplicando limpieza

        const [rows] = await db.execute(query, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: `Producto con ID ${id} no encontrado.` });
        }

        res.status(200).json(rows[0]);

    } catch (error) {
        console.error(`Error al obtener producto ID ${id}:`, error);
        // 🚨 Mensaje de error detallado al cliente
        res.status(500).json({ message: "Error interno al obtener los datos del producto." });
    }
};