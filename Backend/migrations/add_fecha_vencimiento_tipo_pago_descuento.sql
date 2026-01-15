-- Migración para agregar fecha_vencimiento a tabla facturas
-- y descuento a tabla factura_detalles

-- 1. Agregar columna a tabla facturas
ALTER TABLE facturas 
ADD COLUMN IF NOT EXISTS fecha_vencimiento DATE NULL AFTER fecha_emision;

-- 2. Agregar columna descuento a tabla factura_detalles
ALTER TABLE factura_detalles
ADD COLUMN IF NOT EXISTS descuento DECIMAL(5,2) DEFAULT 0.00 AFTER precio_unitario;

-- 3. Actualizar registros existentes con valores por defecto
UPDATE factura_detalles 
SET descuento = 0.00 
WHERE descuento IS NULL;

-- 4. Verificar las columnas creadas
SELECT 'Columnas agregadas exitosamente a la tabla facturas:' as mensaje;
DESCRIBE facturas;

SELECT 'Columnas agregadas exitosamente a la tabla factura_detalles:' as mensaje;
DESCRIBE factura_detalles;
