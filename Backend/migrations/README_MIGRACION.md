# INSTRUCCIONES PARA EJECUTAR LA MIGRACIÓN

## Descripción
Esta migración agrega las siguientes columnas a la base de datos:

### Tabla `facturas`:
- `fecha_vencimiento` (DATE NULL) - Almacena la fecha de vencimiento de la factura

### Tabla `factura_detalles`:
- `descuento` (DECIMAL(5,2)) - Almacena el porcentaje de descuento aplicado al producto (0.00 - 100.00)

## Pasos para ejecutar la migración

### Opción 1: MySQL Workbench
1. Abre MySQL Workbench
2. Conéctate a tu base de datos
3. Abre el archivo `add_fecha_vencimiento_tipo_pago_descuento.sql`
4. Ejecuta el script (Ctrl + Shift + Enter)

### Opción 2: Línea de comandos
```bash
# Desde la raíz del proyecto Backend
cd Backend/migrations

# Ejecutar la migración (reemplaza los valores con tus credenciales)
mysql -u root -p nombre_base_datos < add_fecha_vencimiento_tipo_pago_descuento.sql
```

### Opción 3: phpMyAdmin
1. Accede a phpMyAdmin
2. Selecciona tu base de datos
3. Ve a la pestaña "SQL"
4. Copia y pega el contenido del archivo `add_fecha_vencimiento_tipo_pago_descuento.sql`
5. Haz clic en "Continuar" o "Ejecutar"

## Verificación
Después de ejecutar la migración, puedes verificar que las columnas se crearon correctamente:

```sql
-- Verificar tabla facturas
DESCRIBE facturas;

-- Verificar tabla factura_detalles
DESCRIBE factura_detalles;
```

## Notas importantes
- Esta migración es compatible con MySQL 5.7 y superior
- Usa `IF NOT EXISTS` para evitar errores si las columnas ya existen
- Los registros existentes se actualizarán con valores por defecto:
  - `tipo_pago` = 'Contado'
  - `descuento` = 0.00
- La columna `fecha_vencimiento` puede ser NULL (no es obligatoria para pagos de contado)

## Rollback (Deshacer cambios)
Si necesitas revertir los cambios:

```sql
ALTER TABLE facturas 
DROP COLUMN IF EXISTS fecha_vencimiento,
DROP COLUMN IF EXISTS tipo_pago;

ALTER TABLE factura_detalles
DROP COLUMN IF EXISTS descuento;
```
