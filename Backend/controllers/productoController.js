// Backend/controllers/productoController.js

import db from '../models/db.js';

// =======================================================
// 1. OBTENER PRODUCTOS (GET) CON BÚSQUEDA, PAGINACIÓN (30) Y ORDENAMIENTO (MÁS RECIENTE)
// =======================================================
export const getAllProductos = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30; // Límite de 30 para paginación
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
        let countQuery = `SELECT COUNT(*) as total FROM productos ${whereClause}`;
        let [countResult] = await db.execute(countQuery, searchParams.length > 0 ? searchParams : []); 
        const totalItems = countResult[0].total;

        // Consulta de datos. Ordenamos por ID DESC (más reciente)
        const dataQuery = `
            SELECT id, codigo, nombre, descripcion, precio, impuesto_porcentaje, created_at
            FROM productos 
            ${whereClause}
            ORDER BY id DESC    
            LIMIT ${Number(limit)} OFFSET ${Number(offset)}
        `;
        
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

// =======================================================
// 2. REGISTRAR NUEVO PRODUCTO (POST)
// =======================================================
export const createProducto = async (req, res) => {
    const { codigo, nombre, descripcion, precio, impuesto_porcentaje } = req.body;

    if (!codigo || !nombre || precio === undefined) {
        return res.status(400).json({ message: "Código, nombre y precio son requeridos." });
    }

    try {
        const query = `
            INSERT INTO productos (codigo, nombre, descripcion, precio, impuesto_porcentaje)
            VALUES (?, ?, ?, ?, ?)
        `;
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
        res.status(500).json({ message: "Error interno al registrar el producto." });
    }
};

// =======================================================
// 3. ACTUALIZAR PRODUCTO (PUT)
// =======================================================
export const updateProducto = async (req, res) => {
    const { id } = req.params;
    const { codigo, nombre, descripcion, precio, impuesto_porcentaje } = req.body;

    if (!codigo || !nombre || precio === undefined) {
        return res.status(400).json({ message: "Código, nombre y precio son requeridos para la actualización." });
    }

    try {
        const query = `
            UPDATE productos 
            SET codigo = ?, nombre = ?, descripcion = ?, precio = ?, impuesto_porcentaje = ? 
            WHERE id = ?
        `;
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
        res.status(500).json({ message: "Error interno al actualizar el producto." });
    }
};