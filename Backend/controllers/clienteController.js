// Backend/controllers/clienteController.js

import db from '../models/db.js'; 
// Importa las funciones ya existentes
export const getAllClientes = async (req, res) => {
    // ... tu código existente para GET /api/clientes ...
};

// =======================================================
// 🚨 NUEVA FUNCIÓN: createCliente (POST)
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
        return res.status(200).json({ 
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

        // 3. Ejecutar la inserción
        // Usamos pool.execute (que es la forma segura contra inyección SQL de mysql2/promise)
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
        // Manejar errores de DB (ej: identificación DUPLICADA)
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