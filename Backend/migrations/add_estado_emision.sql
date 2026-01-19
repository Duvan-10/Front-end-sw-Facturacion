-- ========================================================================
-- MIGRACIÓN: Agregar columna estado_emision a tabla facturas
-- PROPÓSITO: Registrar el estado del envío de la factura por email
-- VALORES: 
--   'pendiente' = Factura no ha sido emitida aún
--   'emitida' = Factura se envió exitosamente al cliente
--   'error' = Error al enviar (email inválido, cliente no encontrado, etc.)
-- FECHA: 19 de enero de 2026
-- ========================================================================

ALTER TABLE facturas 
ADD COLUMN estado_emision ENUM('pendiente', 'emitida', 'error') 
DEFAULT 'pendiente' 
COMMENT 'Estado del envío por email de la factura';

-- Crear índice para búsquedas rápidas por estado de emisión
CREATE INDEX idx_estado_emision ON facturas(estado_emision);

-- Nota: Las facturas existentes tendrán el valor 'pendiente' por defecto
