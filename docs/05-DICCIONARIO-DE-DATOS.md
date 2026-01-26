# Diccionario de Datos
## Sistema de Facturación Electrónica - PFEPS

---

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Tablas del Sistema](#tablas-del-sistema)
3. [Relaciones entre Tablas](#relaciones-entre-tablas)
4. [Índices y Constraints](#índices-y-constraints)
5. [Tipos de Datos Utilizados](#tipos-de-datos-utilizados)

---

## 📖 1. Introducción

Este diccionario de datos describe la estructura completa de la base de datos del Sistema de Facturación Electrónica PFEPS, incluyendo todas las tablas, columnas, tipos de datos, restricciones y relaciones.

**Sistema de Gestión de Base de Datos**: MySQL 8.0+  
**Motor de Almacenamiento**: InnoDB  
**Charset**: utf8mb4  
**Collation**: utf8mb4_unicode_ci

---

## 🗄️ 2. Tablas del Sistema

### 2.1 Tabla: `users`

**Descripción**: Almacena información de los usuarios del sistema con diferentes roles.

**Nombre físico**: `users`

| Columna | Tipo de Dato | Nulo | Clave | Default | Descripción |
|---------|-------------|------|-------|---------|-------------|
| id | INT | NO | PK, AI | - | Identificador único del usuario |
| name | VARCHAR(255) | NO | - | - | Nombre completo del usuario |
| identification | VARCHAR(50) | NO | UNIQUE | - | Número de identificación (Cédula/NIT) |
| email | VARCHAR(255) | NO | UNIQUE | - | Correo electrónico del usuario |
| password | VARCHAR(255) | NO | - | - | Contraseña encriptada con bcrypt |
| role | ENUM | NO | - | 'user' | Rol del usuario: 'admin', 'user', 'empleado' |
| profile_photo | VARCHAR(255) | YES | - | NULL | Ruta de la foto de perfil |
| reset_token | VARCHAR(255) | YES | - | NULL | Token para recuperación de contraseña |
| reset_token_expires | DATETIME | YES | - | NULL | Fecha de expiración del token (1 hora) |
| created_at | TIMESTAMP | NO | - | CURRENT_TIMESTAMP | Fecha de creación del registro |

**Constraints**:
- `PK_users`: PRIMARY KEY (id)
- `UQ_users_identification`: UNIQUE (identification)
- `UQ_users_email`: UNIQUE (email)
- `CHK_users_role`: CHECK (role IN ('admin', 'user', 'empleado'))

**Índices**:
- `idx_users_email`: INDEX (email) - Para búsquedas por email
- `idx_users_identification`: INDEX (identification) - Para búsquedas por identificación
- `idx_users_reset_token`: INDEX (reset_token) - Para recuperación de contraseña

**Notas**:
- El primer usuario registrado se crea automáticamente con rol 'admin'
- El campo `password` almacena el hash bcrypt (salt rounds = 10)
- El token de recuperación expira después de 1 hora
- Las fotos de perfil se almacenan en `/Front-End/src/Pictures/Profile/`

---

### 2.2 Tabla: `clientes`

**Descripción**: Almacena información de los clientes a los que se les emiten facturas.

**Nombre físico**: `clientes`

| Columna | Tipo de Dato | Nulo | Clave | Default | Descripción |
|---------|-------------|------|-------|---------|-------------|
| id | INT | NO | PK, AI | - | Identificador único del cliente |
| tipo_identificacion | ENUM | NO | - | - | Tipo: 'Cedula', 'NIT', 'Pasaporte' |
| identificacion | VARCHAR(50) | NO | UNIQUE | - | Número de identificación del cliente |
| nombre_razon_social | VARCHAR(255) | NO | - | - | Nombre o razón social del cliente |
| email | VARCHAR(255) | YES | - | NULL | Correo electrónico del cliente |
| telefono | VARCHAR(20) | YES | - | NULL | Número de teléfono |
| direccion | TEXT | YES | - | NULL | Dirección física del cliente |
| fecha_creacion | DATETIME | NO | - | CURRENT_TIMESTAMP | Fecha de registro del cliente |

**Constraints**:
- `PK_clientes`: PRIMARY KEY (id)
- `UQ_clientes_identificacion`: UNIQUE (identificacion)
- `CHK_clientes_tipo`: CHECK (tipo_identificacion IN ('Cedula', 'NIT', 'Pasaporte'))

**Índices**:
- `idx_clientes_identificacion`: INDEX (identificacion) - Para búsquedas rápidas
- `idx_clientes_nombre`: INDEX (nombre_razon_social) - Para búsquedas por nombre
- `idx_clientes_email`: INDEX (email) - Para envío de facturas

**Notas**:
- El campo `identificacion` debe ser único en el sistema
- El campo `email` es requerido para poder emitir facturas
- La fecha de creación se registra desde el cliente (hora de la PC)

---

### 2.3 Tabla: `productos`

**Descripción**: Catálogo de productos o servicios disponibles para facturación.

**Nombre físico**: `productos`

| Columna | Tipo de Dato | Nulo | Clave | Default | Descripción |
|---------|-------------|------|-------|---------|-------------|
| id | INT | NO | PK, AI | - | Identificador único del producto |
| codigo | VARCHAR(50) | NO | UNIQUE | - | Código único del producto |
| nombre | VARCHAR(255) | NO | - | - | Nombre del producto o servicio |
| precio | DECIMAL(10,2) | NO | - | - | Precio unitario del producto |
| impuesto_porcentaje | DECIMAL(5,2) | NO | - | 0.00 | Porcentaje de IVA (0-100) |
| descripcion | TEXT | YES | - | 'Sin detalles' | Descripción detallada del producto |
| created_at | TIMESTAMP | NO | - | CURRENT_TIMESTAMP | Fecha de creación del registro |

**Constraints**:
- `PK_productos`: PRIMARY KEY (id)
- `UQ_productos_codigo`: UNIQUE (codigo)
- `CHK_productos_precio`: CHECK (precio >= 0)
- `CHK_productos_impuesto`: CHECK (impuesto_porcentaje >= 0 AND impuesto_porcentaje <= 100)

**Índices**:
- `idx_productos_codigo`: INDEX (codigo) - Para búsquedas rápidas
- `idx_productos_nombre`: INDEX (nombre) - Para autocompletado

**Notas**:
- El precio no puede ser negativo
- El impuesto se expresa en porcentaje (ej: 19.00 = 19%)
- Si la descripción está vacía, se asigna "Sin detalles"

---

### 2.4 Tabla: `facturas`

**Descripción**: Encabezado de las facturas emitidas a clientes.

**Nombre físico**: `facturas`

| Columna | Tipo de Dato | Nulo | Clave | Default | Descripción |
|---------|-------------|------|-------|---------|-------------|
| id | INT | NO | PK, AI | - | Identificador único de la factura |
| numero_factura | VARCHAR(50) | NO | UNIQUE | - | Número consecutivo de la factura |
| cliente_id | INT | NO | FK | - | ID del cliente (referencia a `clientes`) |
| fecha_creacion | DATETIME | NO | - | CURRENT_TIMESTAMP | Fecha de creación de la factura |
| fecha_emision | DATETIME | YES | - | NULL | Fecha de emisión real (envío por email) |
| fecha_vencimiento | DATE | YES | - | NULL | Fecha límite de pago |
| subtotal | DECIMAL(10,2) | NO | - | - | Suma de productos sin impuestos |
| iva | DECIMAL(10,2) | NO | - | - | Monto total de impuestos |
| total | DECIMAL(10,2) | NO | - | - | Total de la factura (subtotal + iva) |
| estado | ENUM | NO | - | 'Pendiente' | Estado de pago de la factura |
| estado_emision | ENUM | NO | - | 'pendiente' | Estado de emisión de la factura |
| descuento_porcentaje | DECIMAL(5,2) | NO | - | 0.00 | Descuento global aplicado (0-100%) |

**Valores ENUM - estado**:
- `'Pendiente'`: Factura creada, pago pendiente
- `'Pagada'`: Factura pagada completamente
- `'Parcial'`: Pago parcial recibido
- `'Vencida'`: Factura con fecha de vencimiento superada
- `'Anulada'`: Factura anulada, no válida

**Valores ENUM - estado_emision**:
- `'pendiente'`: No ha sido emitida (PDF no generado)
- `'emitida'`: PDF generado y enviado por email
- `'error'`: Error al generar PDF o enviar email

**Constraints**:
- `PK_facturas`: PRIMARY KEY (id)
- `UQ_facturas_numero`: UNIQUE (numero_factura)
- `FK_facturas_cliente`: FOREIGN KEY (cliente_id) REFERENCES clientes(id)
- `CHK_facturas_estado`: CHECK (estado IN ('Pendiente', 'Pagada', 'Parcial', 'Vencida', 'Anulada'))
- `CHK_facturas_estado_emision`: CHECK (estado_emision IN ('pendiente', 'emitida', 'error'))
- `CHK_facturas_descuento`: CHECK (descuento_porcentaje >= 0 AND descuento_porcentaje <= 100)

**Índices**:
- `idx_facturas_numero`: INDEX (numero_factura) - Para búsquedas
- `idx_facturas_cliente`: INDEX (cliente_id) - Para filtrar por cliente
- `idx_facturas_fecha_creacion`: INDEX (fecha_creacion) - Para ordenamiento
- `idx_facturas_estado`: INDEX (estado) - Para filtrado por estado

**Notas**:
- `fecha_emision` se actualiza cuando se emite la factura
- El cálculo del estado de vencimiento se realiza automáticamente comparando `fecha_vencimiento` con la fecha actual
- El `numero_factura` se genera automáticamente de forma consecutiva

---

### 2.5 Tabla: `factura_detalles`

**Descripción**: Líneas de detalle de los productos incluidos en cada factura.

**Nombre físico**: `factura_detalles`

| Columna | Tipo de Dato | Nulo | Clave | Default | Descripción |
|---------|-------------|------|-------|---------|-------------|
| id | INT | NO | PK, AI | - | Identificador único del detalle |
| factura_id | INT | NO | FK | - | ID de la factura (referencia a `facturas`) |
| producto_id | INT | NO | FK | - | ID del producto (referencia a `productos`) |
| cantidad | INT | NO | - | - | Cantidad de unidades del producto |
| precio_unitario | DECIMAL(10,2) | NO | - | - | Precio unitario al momento de la venta |
| descuento | DECIMAL(5,2) | NO | - | 0.00 | Descuento aplicado en % (0-100) |
| subtotal | DECIMAL(10,2) | NO | - | - | (cantidad × precio_unitario) sin impuestos |
| total | DECIMAL(10,2) | NO | - | - | Subtotal + IVA - descuento |

**Constraints**:
- `PK_factura_detalles`: PRIMARY KEY (id)
- `FK_detalles_factura`: FOREIGN KEY (factura_id) REFERENCES facturas(id) ON DELETE CASCADE
- `FK_detalles_producto`: FOREIGN KEY (producto_id) REFERENCES productos(id)
- `CHK_detalles_cantidad`: CHECK (cantidad > 0)
- `CHK_detalles_descuento`: CHECK (descuento >= 0 AND descuento <= 100)

**Índices**:
- `idx_detalles_factura`: INDEX (factura_id) - Para listar detalles de una factura
- `idx_detalles_producto`: INDEX (producto_id) - Para análisis de ventas por producto

**Notas**:
- Al eliminar una factura, se eliminan automáticamente sus detalles (CASCADE)
- El precio unitario se copia del producto al momento de crear la factura
- El descuento se aplica por línea de producto

**Cálculo de totales**:
```
subtotal_linea = (cantidad × precio_unitario) × (1 - descuento/100)
iva_linea = subtotal_linea × (impuesto_porcentaje/100)
total_linea = subtotal_linea + iva_linea
```

---

### 2.6 Tabla: `reportes`

**Descripción**: Almacena reportes generados por el sistema para consulta posterior.

**Nombre físico**: `reportes`

| Columna | Tipo de Dato | Nulo | Clave | Default | Descripción |
|---------|-------------|------|-------|---------|-------------|
| id | INT | NO | PK, AI | - | Identificador único del reporte |
| tipo | VARCHAR(50) | NO | - | - | Tipo de reporte: 'ventas', 'clientes', 'productos' |
| fecha_inicio | DATE | NO | - | - | Fecha de inicio del período del reporte |
| fecha_fin | DATE | NO | - | - | Fecha de fin del período del reporte |
| contenido | JSON | YES | - | NULL | Datos del reporte en formato JSON |
| created_at | TIMESTAMP | NO | - | CURRENT_TIMESTAMP | Fecha de generación del reporte |

**Constraints**:
- `PK_reportes`: PRIMARY KEY (id)
- `CHK_reportes_fechas`: CHECK (fecha_fin >= fecha_inicio)

**Índices**:
- `idx_reportes_tipo`: INDEX (tipo) - Para filtrar por tipo
- `idx_reportes_fecha`: INDEX (fecha_inicio, fecha_fin) - Para búsqueda por período

**Estructura JSON del campo `contenido`** (ejemplo para reporte de ventas):
```json
{
  "total_facturas": 150,
  "total_ventas": 45000000.00,
  "facturas_pendientes": 25,
  "facturas_pagadas": 120,
  "facturas_anuladas": 5,
  "top_clientes": [
    {
      "id": 5,
      "nombre": "Empresa XYZ",
      "total_comprado": 8000000.00
    }
  ],
  "ventas_por_mes": [
    {
      "mes": "2025-01",
      "total": 15000000.00
    }
  ]
}
```

---

## 🔗 3. Relaciones entre Tablas

### Diagrama Entidad-Relación (ER)

```
┌──────────────┐
│    users     │
│  (Usuarios)  │
└──────────────┘
      │ (1 usuario puede crear N facturas - opcional)
      │
      │
      ▼
┌──────────────┐         1:N          ┌──────────────┐
│   clientes   │◄─────────────────────┤   facturas   │
│  (Clientes)  │                      │  (Facturas)  │
└──────────────┘                      └──────┬───────┘
      │                                      │
      │ 1:N                                  │ 1:N
      │                                      │
      │                                      ▼
      │                              ┌──────────────────┐
      │                              │ factura_detalles │
      │                              │    (Detalles)    │
      │                              └────────┬─────────┘
      │                                       │
      │                                       │ N:1
      │                                       │
      │                                       ▼
      │                              ┌──────────────┐
      └──────────────────────────────┤  productos   │
                                     │ (Productos)  │
                                     └──────────────┘


┌──────────────┐
│   reportes   │
│  (Reportes)  │
└──────────────┘
      ↑
      │ (Los reportes consultan datos de facturas, no hay FK)
      │
```

### Relaciones Detalladas

#### 3.1 clientes → facturas (1:N)
- **Tipo**: Uno a muchos
- **Cardinalidad**: Un cliente puede tener múltiples facturas
- **Clave Foránea**: `facturas.cliente_id` → `clientes.id`
- **Integridad Referencial**: RESTRICT (no se puede eliminar un cliente con facturas)

#### 3.2 facturas → factura_detalles (1:N)
- **Tipo**: Uno a muchos
- **Cardinalidad**: Una factura tiene múltiples líneas de detalle
- **Clave Foránea**: `factura_detalles.factura_id` → `facturas.id`
- **Integridad Referencial**: CASCADE (al eliminar factura, se eliminan sus detalles)

#### 3.3 productos → factura_detalles (1:N)
- **Tipo**: Uno a muchos
- **Cardinalidad**: Un producto puede aparecer en múltiples facturas
- **Clave Foránea**: `factura_detalles.producto_id` → `productos.id`
- **Integridad Referencial**: RESTRICT (no se puede eliminar un producto usado en facturas)

---

## 🔑 4. Índices y Constraints

### 4.1 Índices por Tabla

#### Tabla: users
```sql
PRIMARY KEY: id
UNIQUE INDEX: identification, email
INDEX: idx_users_email
INDEX: idx_users_identification
INDEX: idx_users_reset_token
```

#### Tabla: clientes
```sql
PRIMARY KEY: id
UNIQUE INDEX: identificacion
INDEX: idx_clientes_identificacion
INDEX: idx_clientes_nombre
INDEX: idx_clientes_email
```

#### Tabla: productos
```sql
PRIMARY KEY: id
UNIQUE INDEX: codigo
INDEX: idx_productos_codigo
INDEX: idx_productos_nombre
```

#### Tabla: facturas
```sql
PRIMARY KEY: id
UNIQUE INDEX: numero_factura
FOREIGN KEY: cliente_id → clientes(id)
INDEX: idx_facturas_numero
INDEX: idx_facturas_cliente
INDEX: idx_facturas_fecha_creacion
INDEX: idx_facturas_estado
```

#### Tabla: factura_detalles
```sql
PRIMARY KEY: id
FOREIGN KEY: factura_id → facturas(id) ON DELETE CASCADE
FOREIGN KEY: producto_id → productos(id)
INDEX: idx_detalles_factura
INDEX: idx_detalles_producto
```

#### Tabla: reportes
```sql
PRIMARY KEY: id
INDEX: idx_reportes_tipo
INDEX: idx_reportes_fecha (fecha_inicio, fecha_fin)
```

### 4.2 Constraints de Integridad

#### Check Constraints

```sql
-- users
CHK_users_role: role IN ('admin', 'user', 'empleado')

-- clientes
CHK_clientes_tipo: tipo_identificacion IN ('Cedula', 'NIT', 'Pasaporte')

-- productos
CHK_productos_precio: precio >= 0
CHK_productos_impuesto: impuesto_porcentaje >= 0 AND impuesto_porcentaje <= 100

-- facturas
CHK_facturas_estado: estado IN ('Pendiente', 'Pagada', 'Parcial', 'Vencida', 'Anulada')
CHK_facturas_estado_emision: estado_emision IN ('pendiente', 'emitida', 'error')
CHK_facturas_descuento: descuento_porcentaje >= 0 AND descuento_porcentaje <= 100

-- factura_detalles
CHK_detalles_cantidad: cantidad > 0
CHK_detalles_descuento: descuento >= 0 AND descuento <= 100

-- reportes
CHK_reportes_fechas: fecha_fin >= fecha_inicio
```

#### Foreign Key Constraints

```sql
-- facturas
FK_facturas_cliente:
  FOREIGN KEY (cliente_id) REFERENCES clientes(id)
  ON UPDATE CASCADE
  ON DELETE RESTRICT

-- factura_detalles
FK_detalles_factura:
  FOREIGN KEY (factura_id) REFERENCES facturas(id)
  ON UPDATE CASCADE
  ON DELETE CASCADE

FK_detalles_producto:
  FOREIGN KEY (producto_id) REFERENCES productos(id)
  ON UPDATE CASCADE
  ON DELETE RESTRICT
```

---

## 📊 5. Tipos de Datos Utilizados

### 5.1 Tipos Numéricos

| Tipo | Uso | Rango | Ejemplo |
|------|-----|-------|---------|
| INT | IDs, cantidades | -2,147,483,648 a 2,147,483,647 | `id`, `cantidad` |
| DECIMAL(10,2) | Montos, precios | Precisión de 2 decimales | `precio`, `total` |
| DECIMAL(5,2) | Porcentajes | 0.00 a 100.00 | `impuesto_porcentaje`, `descuento` |

### 5.2 Tipos de Texto

| Tipo | Uso | Longitud | Ejemplo |
|------|-----|----------|---------|
| VARCHAR(50) | Códigos, identificaciones | Hasta 50 caracteres | `codigo`, `identification` |
| VARCHAR(255) | Nombres, emails, rutas | Hasta 255 caracteres | `name`, `email`, `profile_photo` |
| TEXT | Descripciones, direcciones | Hasta 65,535 caracteres | `descripcion`, `direccion` |

### 5.3 Tipos de Fecha y Hora

| Tipo | Uso | Formato | Ejemplo |
|------|-----|---------|---------|
| DATETIME | Fecha y hora exactas | YYYY-MM-DD HH:MM:SS | `fecha_creacion`, `fecha_emision` |
| DATE | Solo fecha | YYYY-MM-DD | `fecha_vencimiento` |
| TIMESTAMP | Marca de tiempo con zona horaria | YYYY-MM-DD HH:MM:SS | `created_at` |

### 5.4 Tipos Especiales

| Tipo | Uso | Valores | Ejemplo |
|------|-----|---------|---------|
| ENUM | Valores predefinidos | Lista cerrada de opciones | `role`, `estado`, `estado_emision` |
| JSON | Datos estructurados | Formato JSON válido | `contenido` en reportes |

### 5.5 Convenciones de Naming

**Tablas**:
- snake_case
- Plural (excepto para tablas de relación)
- Ejemplos: `users`, `clientes`, `factura_detalles`

**Columnas**:
- snake_case
- Singular
- Ejemplos: `fecha_creacion`, `numero_factura`, `impuesto_porcentaje`

**Claves Foráneas**:
- Formato: `{tabla_singular}_id`
- Ejemplos: `cliente_id`, `producto_id`, `factura_id`

**Índices**:
- Formato: `idx_{tabla}_{columna(s)}`
- Ejemplos: `idx_facturas_cliente`, `idx_productos_codigo`

**Constraints**:
- Primary Key: `PK_{tabla}`
- Foreign Key: `FK_{tabla1}_{tabla2}`
- Unique: `UQ_{tabla}_{columna}`
- Check: `CHK_{tabla}_{descripcion}`

---

## 📈 6. Estadísticas de la Base de Datos

### Volúmenes Estimados

| Tabla | Registros Esperados (1 año) | Crecimiento Mensual |
|-------|----------------------------|-------------------|
| users | 10-50 | 1-5 |
| clientes | 100-500 | 10-50 |
| productos | 50-200 | 5-20 |
| facturas | 1,000-5,000 | 100-400 |
| factura_detalles | 5,000-25,000 | 500-2,000 |
| reportes | 12-100 | 1-10 |

### Tamaño de Almacenamiento Estimado

| Tabla | Tamaño por Registro | Tamaño Anual Estimado |
|-------|-------------------|---------------------|
| users | ~500 bytes | ~25 KB |
| clientes | ~300 bytes | ~150 KB |
| productos | ~250 bytes | ~50 KB |
| facturas | ~200 bytes | ~1 MB |
| factura_detalles | ~100 bytes | ~2.5 MB |
| reportes | ~5 KB | ~500 KB |
| **TOTAL** | - | **~4.2 MB/año** |

---

## 🔍 7. Consultas SQL Comunes

### 7.1 Obtener factura completa con detalles

```sql
SELECT 
    f.id AS factura_id,
    f.numero_factura,
    f.fecha_creacion,
    f.fecha_emision,
    f.total,
    f.estado,
    c.nombre_razon_social AS cliente,
    c.identificacion AS cliente_id,
    c.email AS cliente_email,
    fd.cantidad,
    p.nombre AS producto,
    fd.precio_unitario,
    fd.descuento,
    fd.total AS linea_total
FROM facturas f
JOIN clientes c ON f.cliente_id = c.id
JOIN factura_detalles fd ON f.id = fd.factura_id
JOIN productos p ON fd.producto_id = p.id
WHERE f.id = ?;
```

### 7.2 Obtener ventas por cliente

```sql
SELECT 
    c.id,
    c.nombre_razon_social,
    COUNT(f.id) AS total_facturas,
    SUM(f.total) AS total_vendido,
    MAX(f.fecha_creacion) AS ultima_factura
FROM clientes c
LEFT JOIN facturas f ON c.id = f.cliente_id
WHERE f.estado != 'Anulada'
GROUP BY c.id, c.nombre_razon_social
ORDER BY total_vendido DESC;
```

### 7.3 Productos más vendidos

```sql
SELECT 
    p.id,
    p.codigo,
    p.nombre,
    SUM(fd.cantidad) AS cantidad_vendida,
    SUM(fd.total) AS ingresos_generados
FROM productos p
JOIN factura_detalles fd ON p.id = fd.producto_id
JOIN facturas f ON fd.factura_id = f.id
WHERE f.estado != 'Anulada'
GROUP BY p.id, p.codigo, p.nombre
ORDER BY cantidad_vendida DESC
LIMIT 10;
```

---

**Documento creado**: Enero 2026  
**Versión**: 1.0  
**Sistema**: Facturación Electrónica PFEPS
