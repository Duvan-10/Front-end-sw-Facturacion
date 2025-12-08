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
// 2. FUNCIÓN PARA CREAR UN CLIENTE (POST) - Ya funciona
// =======================================================
export const createCliente = async (req, res) => {
    const { 
        tipo_identificacion, 
        identificacion, 
        nombre_razon_social, 
        email, 
        telefono, 
        direccion 
    } = req.body;

    // 1. Validación básica de datos CRÍTICOS
    if (!identificacion || !nombre_razon_social) {
        // 🚨 CORRECCIÓN: Usar 400 Bad Request
        return res.status(400).json({ 
            message: 'Identificación y Razón Social son campos obligatorios.' 
        });
    }

    try {
        // 2. Consulta SQL para la inserción
        const query = `
            INSERT INTO clientes (
                tipo_identificacion, 
                identificacion, 
                nombre_razon_social, 
                email, 
                telefono, 
                direccion
            ) VALUES (?, ?, ?, ?, ?, ?)
        `;

        // 3. Ejecutar la inserción (db.execute libera la conexión automáticamente)
        const [result] = await db.execute(query, [
            tipo_identificacion, 
            identificacion, 
            nombre_razon_social, 
            email, 
            telefono, 
            direccion
        ]);

        // 4. Respuesta exitosa
        return res.status(201).json({ 
            message: 'Cliente registrado con éxito.', 
            id: result.insertId 
        });

    } catch (error) {
        // ... (Tu manejo de errores existente) ...
        console.error('Error al registrar cliente:', error);
        
        let errorMessage = 'Error interno del servidor al registrar cliente.';
        if (error.code === 'ER_DUP_ENTRY') {
            errorMessage = 'La identificación o el correo electrónico ya están registrados.';
        }

        return res.status(500).json({ 
            message: errorMessage,
            error: error.message 
        });
    }
};