// ruta: Backend/controllers/cliente.controller.js (ACTUALIZADO CON BUSCADOR)

import pool from '../models/db.js'; 
const clienteController = {};

// ----------------------------------------------------
// 1. BUSCAR POR IDENTIFICACIÓN (NUEVO - Para Auto-relleno en Factura)
// ----------------------------------------------------
clienteController.getClienteByIdentificacion = async (req, res) => {
    const { identificacion } = req.params;
    let connection;
    try {
        connection = await pool.getConnection();
        const query = `
            SELECT id, tipo_identificacion, identificacion, nombre_razon_social, email, telefono, direccion 
            FROM clientes 
            WHERE identificacion = ? 
            LIMIT 1
        `;
        const [rows] = await connection.execute(query, [identificacion]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado.' });
        }
        
        res.status(200).json(rows[0]);

    } catch (error) {
        console.error("Error al buscar cliente por identificación:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    } finally {
        if (connection) connection.release();
    }
};

// ----------------------------------------------------
// 2. CREAR NUEVO CLIENTE (POST /api/clientes)
// ----------------------------------------------------
clienteController.createCliente = async (req, res) => {
    const { tipo_identificacion, identificacion, nombre_razon_social, email, telefono, direccion } = req.body;
    
    if (!tipo_identificacion || !identificacion || !nombre_razon_social) {
        return res.status(400).json({ message: 'El tipo de identificación, la identificación y el nombre son campos obligatorios.' });
    }

    let connection;
    try {
        connection = await pool.getConnection();

        const query = `
            INSERT INTO clientes (tipo_identificacion, identificacion, nombre_razon_social, email, telefono, direccion)
            VALUES (?, ?, ?, ?, ?, ?);
        `;
        const values = [tipo_identificacion, identificacion, nombre_razon_social, email || null, telefono || null, direccion || null];
        
        const [result] = await connection.execute(query, values);
        
        const [newCliente] = await connection.execute(
            'SELECT id, tipo_identificacion, identificacion, nombre_razon_social, email, telefono, direccion, fecha_creacion FROM clientes WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            message: 'Cliente creado con éxito',
            cliente: newCliente[0]
        });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: `Ya existe un cliente con la identificación ${identificacion}.` });
        }
        console.error("Error al crear cliente:", error);
        res.status(500).json({ message: 'Error interno del servidor al crear el cliente.' });
    } finally {
        if (connection) connection.release();
    }
};

// ----------------------------------------------------
// 3. OBTENER TODOS LOS CLIENTES (GET /api/clientes)
// ----------------------------------------------------
clienteController.getClientes = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const query = "SELECT id, tipo_identificacion, identificacion, nombre_razon_social, email, telefono, direccion, fecha_creacion FROM clientes ORDER BY nombre_razon_social ASC";
        const [rows] = await connection.execute(query);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error al obtener clientes:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    } finally {
        if (connection) connection.release();
    }
};

// ----------------------------------------------------
// 4. OBTENER UN SOLO CLIENTE POR ID (GET /api/clientes/:id)
// ----------------------------------------------------
clienteController.getClienteById = async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await pool.getConnection();
        const query = "SELECT id, tipo_identificacion, identificacion, nombre_razon_social, email, telefono, direccion, fecha_creacion FROM clientes WHERE id = ?";
        const [rows] = await connection.execute(query, [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Cliente no encontrado.' });
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error("Error al obtener cliente por ID:", error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    } finally {
        if (connection) connection.release();
    }
};

// ----------------------------------------------------
// 5. ACTUALIZAR CLIENTE (PUT /api/clientes/:id)
// ----------------------------------------------------
clienteController.updateCliente = async (req, res) => {
    const { id } = req.params;
    const { tipo_identificacion, identificacion, nombre_razon_social, email, telefono, direccion } = req.body; 
    
    if (!nombre_razon_social || !identificacion || !tipo_identificacion) {
        return res.status(400).json({ message: 'Faltan campos obligatorios.' });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        const query = `
            UPDATE clientes
            SET tipo_identificacion = ?, identificacion = ?, nombre_razon_social = ?, email = ?, telefono = ?, direccion = ?
            WHERE id = ?;
        `;
        const values = [tipo_identificacion, identificacion, nombre_razon_social, email || null, telefono || null, direccion || null, id];
        const [result] = await connection.execute(query, values);

        if (result.affectedRows === 0) return res.status(404).json({ message: 'Cliente no encontrado.' });

        const [updatedCliente] = await connection.execute(
            'SELECT id, tipo_identificacion, identificacion, nombre_razon_social, email, telefono, direccion, fecha_creacion FROM clientes WHERE id = ?',
            [id]
        );
        res.status(200).json({ message: 'Cliente actualizado', cliente: updatedCliente[0] });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: `Identificación duplicada.` });
        }
        res.status(500).json({ message: 'Error interno del servidor.' });
    } finally {
        if (connection) connection.release();
    }
};

// ----------------------------------------------------
// 6. ELIMINAR CLIENTE (DELETE /api/clientes/:id)
// ----------------------------------------------------
clienteController.deleteCliente = async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await pool.getConnection();
        const query = "DELETE FROM clientes WHERE id = ?";
        const [result] = await connection.execute(query, [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'No encontrado.' });
        res.status(200).json({ message: 'Cliente eliminado', clienteId: id });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
             return res.status(409).json({ message: 'Tiene facturas asociadas.' });
        }
        res.status(500).json({ message: 'Error interno.' });
    } finally {
        if (connection) connection.release();
    }
};

// ----------------------------------------------------
// 7. BUSCAR CLIENTES POR COINCIDENCIA (CORREGIDO - Con Email)
// ----------------------------------------------------
clienteController.searchClientes = async (req, res) => {
    const { term } = req.query; 
    if (!term) return res.status(200).json([]);

    let connection;
    try {
        connection = await pool.getConnection();
        const query = `
            SELECT id, identificacion, nombre_razon_social, email, telefono, direccion 
            FROM clientes 
            WHERE identificacion LIKE ? OR nombre_razon_social LIKE ?
            LIMIT 10
        `;
        const searchTerm = `%${term}%`;
        const [rows] = await connection.execute(query, [searchTerm, searchTerm]);
        
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error en búsqueda parcial de clientes:", error);
        res.status(500).json({ message: 'Error en el servidor.' });
    } finally {
        if (connection) connection.release();
    }
};
export default clienteController;

