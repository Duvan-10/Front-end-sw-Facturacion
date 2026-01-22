import db from '../config/db.config.js';

// Obtener historial de reportes del usuario por tipo
export const getReportesByTipo = async (req, res) => {
  try {
    const { tipo } = req.query;
    const userId = req.user.id;
    
    // Determinar prefijo según tipo
    let prefix = '';
    if (tipo === 'facturas') prefix = 'RP_FAC';
    else if (tipo === 'clientes') prefix = 'RP_CL';
    else if (tipo === 'productos') prefix = 'RP_PD';
    else return res.status(400).json({ error: 'Tipo de reporte no válido' });
    
    const [reportes] = await db.query(
      `SELECT r.id, r.reporte, r.fecha, r.archivo, u.name as creador
       FROM reportes r
       JOIN users u ON r.creado_por = u.id
       WHERE r.reporte = ? AND r.creado_por = ?
       ORDER BY r.fecha DESC`,
      [prefix, userId]
    );
    
    res.json(reportes);
  } catch (error) {
    console.error('Error obteniendo reportes:', error);
    res.status(500).json({ error: 'Error al cargar reportes' });
  }
};

// Generar y guardar reporte en BD
export const generarReporte = async (req, res) => {
  try {
    const { tipo, subTipo, dateFrom, dateTo } = req.body;
    const userId = req.user.id;
    
    if (!tipo || !subTipo || !dateFrom || !dateTo) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos' });
    }
    
    // Determinar prefijo según tipo
    let prefix = '';
    if (tipo === 'facturas') prefix = 'RP_FAC';
    else if (tipo === 'clientes') prefix = 'RP_CL';
    else if (tipo === 'productos') prefix = 'RP_PD';
    else return res.status(400).json({ error: 'Tipo de reporte no válido' });
    
    const fechaReporte = new Date().toISOString().split('T')[0];
    
    // Guardar en BD
    const [result] = await db.query(
      'INSERT INTO reportes (reporte, fecha, archivo, creado_por) VALUES (?, ?, ?, ?)',
      [prefix, fechaReporte, subTipo, userId]
    );
    
    res.status(201).json({ 
      success: true, 
      reporteId: result.insertId,
      mensaje: 'Reporte generado y guardado correctamente' 
    });
  } catch (error) {
    console.error('Error generando reporte:', error);
    res.status(500).json({ error: 'Error al generar reporte' });
  }
};

// Obtener datos del reporte para descarga en Excel
export const getDatosReporte = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Verificar que el reporte pertenece al usuario
    const [reporteInfo] = await db.query(
      'SELECT * FROM reportes WHERE id = ? AND creado_por = ?',
      [id, userId]
    );
    
    if (reporteInfo.length === 0) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }
    
    const reporte = reporteInfo[0];
    const subTipo = reporte.archivo;
    let datos = [];
    
    // Obtener datos según tipo de reporte
    if (reporte.reporte === 'RP_FAC') {
      // Reporte de Facturas
      let whereClause = '1=1';
      
      if (subTipo === 'Pendientes') whereClause = "f.estado = 'Pendiente'";
      else if (subTipo === 'Pagadas') whereClause = "f.estado = 'Pagada'";
      else if (subTipo === 'Anuladas') whereClause = "f.estado = 'Anulada'";
      else if (subTipo === 'Vencidas') whereClause = "f.estado_vencimiento = 'Vencida'";
      else if (subTipo === 'Parcial') whereClause = "f.estado = 'Parcial'";
      else if (subTipo === 'Emitidas') whereClause = "f.estado_emision = 'emitida'";
      else if (subTipo === 'No Emitidas') whereClause = "(f.estado_emision IS NULL OR f.estado_emision = 'pendiente' OR f.estado_emision = 'error')";
      
      const [facturas] = await db.query(
        `SELECT f.numero_factura AS 'Número Factura',
                c.nombre_razon_social AS 'Cliente',
                f.fecha_creacion AS 'Fecha Creación',
                COALESCE(f.fecha_emision, 'No emitida') AS 'Fecha Emisión',
                f.subtotal AS 'Subtotal',
                f.iva AS 'IVA',
                f.total AS 'Total',
                f.estado AS 'Estado',
                COALESCE(f.estado_emision, 'pendiente') AS 'Estado Emisión'
         FROM facturas f
         JOIN clientes c ON f.cliente_id = c.id
         WHERE ${whereClause}
         ORDER BY f.fecha_creacion DESC`
      );
      datos = facturas;
      
    } else if (reporte.reporte === 'RP_CL') {
      // Reporte de Clientes
      let whereClause = '1=1';
      const hoy = new Date();
      const hace30Dias = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      if (subTipo === 'Clientes Nuevos') whereClause = `c.fecha_creacion >= '${hace30Dias.toISOString().split('T')[0]}'`;
      else if (subTipo === 'Clientes Antiguos') whereClause = `c.fecha_creacion < '${hace30Dias.toISOString().split('T')[0]}'`;
      else if (subTipo === 'Compraron') whereClause = 'c.id IN (SELECT DISTINCT cliente_id FROM facturas)';
      else if (subTipo === 'No Compraron') whereClause = 'c.id NOT IN (SELECT DISTINCT cliente_id FROM facturas WHERE cliente_id IS NOT NULL)';
      
      const [clientes] = await db.query(
        `SELECT c.identificacion AS 'Identificación',
                c.nombre_razon_social AS 'Nombre/Razón Social',
                c.email AS 'Email',
                c.telefono AS 'Teléfono',
                c.direccion AS 'Dirección',
                COUNT(f.id) AS 'Total Facturas',
                COALESCE(SUM(f.total), 0) AS 'Total Comprado'
         FROM clientes c
         LEFT JOIN facturas f ON c.id = f.cliente_id
         WHERE ${whereClause}
         GROUP BY c.id
         ORDER BY c.nombre_razon_social`
      );
      datos = clientes;
      
    } else if (reporte.reporte === 'RP_PD') {
      // Reporte de Productos
      let orderClause = 'p.nombre';
      let whereClause = '1=1';
      
      if (subTipo === 'Mas Vendidos') orderClause = 'COALESCE(SUM(fd.cantidad), 0) DESC';
      else if (subTipo === 'Menos Vendidos') orderClause = 'COALESCE(SUM(fd.cantidad), 0) ASC';
      else if (subTipo === 'Sin Ventas') whereClause = 'p.id NOT IN (SELECT DISTINCT producto_id FROM factura_detalles WHERE producto_id IS NOT NULL)';
      
      const [productos] = await db.query(
        `SELECT p.codigo AS 'Código',
                p.nombre AS 'Nombre',
                p.descripcion AS 'Descripción',
                p.precio AS 'Precio',
                p.impuesto_porcentaje AS 'IVA %',
                COUNT(fd.id) AS 'Veces Vendido',
                COALESCE(SUM(fd.cantidad), 0) AS 'Cantidad Total'
         FROM productos p
         LEFT JOIN factura_detalles fd ON p.id = fd.producto_id
         WHERE ${whereClause}
         GROUP BY p.id
         ORDER BY ${orderClause}`
      );
      datos = productos;
    }
    
    res.json(datos);
  } catch (error) {
    console.error('Error obteniendo datos del reporte:', error);
    res.status(500).json({ error: 'Error al obtener datos del reporte' });
  }
};
