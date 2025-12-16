// Backend/controllers/clienteController.js

import db from '../models/db.js'; 

// =======================================================
// 0. FUNCIÓN PARA OBTENER UN CLIENTE POR ID (GET /:id) <--- NUEVA
// =======================================================
export const getClienteById = async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'SELECT * FROM clientes WHERE id = ?';
        const [rows] = await db.query(query, [id]); 
        
        if (rows.length === 0) {
            return res.status(404).json({ message: `Cliente con ID ${id} no encontrado.` });
        }
        
        // Devolver el primer y único resultado
        return res.status(200).json(rows[0]);

    } catch (error) {
        console.error(`Error al obtener cliente ID ${id}:`, error);
        return res.status(500).json({ 
            message: 'Error interno del servidor al consultar la base de datos.', 
            error: error.message 
        });
    }
};

// =======================================================
// 1. FUNCIÓN PARA OBTENER TODOS LOS CLIENTES (GET)
// =======================================================
// ... (getAllClientes es el mismo) ...

export const getAllClientes = async (req, res) => {
    // ... (Tu código anterior) ...
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
        const [result] = await db.execute(query, [ // 🚨 Capturar el resultado
            tipo_identificacion, 
            identificacion, 
            nombre_razon_social, 
            email, 
            telefono, 
            direccion
        ]);
        
        // 🚨 Respuesta actualizada: Devolver el ID generado
        res.status(201).json({ 
            message: "Cliente creado exitosamente.",
            id: result.insertId // El ID que MySQL generó
        });
        
    } catch (error) {
        // ... (Tu manejo de errores existente) ...
        // ...
        res.status(500).json({ message: errorMessage });
    }
};

// =======================================================
// 3. FUNCIÓN PARA ACTUALIZAR UN CLIENTE (PUT)
// =======================================================
// ... (updateCliente es el mismo) ...
export const updateCliente = async (req, res) => { 
    // ... (Tu código anterior) ...
    // ...
};