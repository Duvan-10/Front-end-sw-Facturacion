// Backend/controllers/clienteController.js

import db from '../models/db.js'; 

// =======================================================
// 1. FUNCIÓN PARA OBTENER TODOS LOS CLIENTES (GET)
// =======================================================
export const getAllClientes = async (req, res) => {

    try {
        // La consulta SQL
        const query = 'SELECT * FROM clientes ORDER BY nombre_razon_social ASC';
        
        // Ejecutar la consulta usando el Pool (db.query)
        const [rows] = await db.query(query); 
        
        // Devolver los datos al Front-end
        return res.status(200).json(rows);

    } catch (error) {
        console.error('Error al obtener clientes desde MySQL:', error);
        return res.status(500).json({ 
            message: 'Error interno del servidor al consultar la base de datos.', 
            error: error.message 
        });
    }
};

// =======================================================
// 2. FUNCIÓN PARA CREAR UN CLIENTE (POST) 
// =======================================================
export const createCliente = async (req, res) => {
    const { tipo_identificacion, identificacion, nombre_razon_social, email, telefono, direccion } = req.body;

    if (!identificacion || !nombre_razon_social) {
        return res.status(400).json({ message: "La Identificación y la Razón Social son obligatorios." });
    }

    const query = `
        INSERT INTO clientes 
        (tipo_identificacion, identificacion, nombre_razon_social, email, telefono, direccion) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    try {
        await db.execute(query, [
            tipo_identificacion, 
            identificacion, 
            nombre_razon_social, 
            email, 
            telefono, 
            direccion
        ]);
        res.status(201).json({ message: "Cliente creado exitosamente." });
    } catch (error) {
        console.error("Error al crear cliente:", error);
        
        let errorMessage = "Error interno del servidor al crear cliente.";
        // Manejo de error de unicidad (si la identificación ya existe)
        if (error.code === 'ER_DUP_ENTRY') {
            errorMessage = 'Error de unicidad: La identificación ya está registrada.';
        }
        
        res.status(500).json({ message: errorMessage });
    }
};

// =======================================================
// 3. FUNCIÓN PARA ACTUALIZAR UN CLIENTE (PUT)
// ====

export const updateCliente = async (req, res) => { 
    // 1. Obtener el ID del cliente de los parámetros de la URL
    const { id } = req.params; 
    
    // 2. Obtener los datos del cuerpo de la petición
    const { 
        tipo_identificacion, 
        identificacion, 
        nombre_razon_social, 
        email, 
        telefono, 
        direccion 
    } = req.body;

    // 1. Validación básica de datos CRÍTICOS
    if (!identificacion || !nombre_razon_social || !id) {
        return res.status(400).json({ 
            message: 'ID, Identificación y Razón Social son obligatorios para actualizar.' 
        });
    }

    try {
        // 2. Consulta SQL para la inserción
        const query = `
            UPDATE clientes SET 
                tipo_identificacion = ?, 
                identificacion = ?, 
                nombre_razon_social = ?, 
                email = ?, 
                telefono = ?, 
                direccion = ?
            WHERE id = ?
        `;
        // 3. Ejecutar la inserción (db.execute libera la conexión automáticamente)
        const [result] = await db.execute(query, [
            tipo_identificacion, 
            identificacion, 
            nombre_razon_social, 
            email, 
            telefono, 
            direccion,
            id // El ID para la cláusula WHERE
        ]);

        // 6. Verificar si se encontró y actualizó el cliente
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: `Cliente con ID ${id} no encontrado.` });
        }

        // 4. Respuesta exitosa
     return res.status(200).json({ 
            message: 'Cliente actualizado con éxito.', 
            id: id 
        });
        
    } catch (error) {
        // ... (Tu manejo de errores existente) ...
        console.error('Error al registrar cliente:', error);
        
        let errorMessage = 'Error interno del servidor al registrar cliente.';

        if (error.code === 'ER_DUP_ENTRY') {
            errorMessage = 'Error de unicidad: La identificación ingresada ya está registrada para otro cliente.';
        }

        return res.status(500).json({ 
            message: errorMessage,
            error: error.message 
        });
    }
};