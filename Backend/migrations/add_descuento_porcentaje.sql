-- ========================================================================
-- MIGRACIÓN: Agregar columna descuento_porcentaje a tabla facturas
-- PROPÓSITO: Registrar el descuento general aplicado a la factura
-- TIPO: DECIMAL(5,2) - porcentaje de descuento (ej: 5 = 5%)
-- FECHA: 19 de enero de 2026
-- ========================================================================

ALTER TABLE facturas 
ADD COLUMN descuento_porcentaje DECIMAL(5,2) 
DEFAULT 0 
COMMENT 'Porcentaje de descuento general aplicado a la factura (ej: 5 = 5%)';

-- Crear índice para búsquedas
CREATE INDEX idx_descuento_porcentaje ON facturas(descuento_porcentaje);

-- Nota: Las facturas existentes tendrán el valor 0 por defecto
