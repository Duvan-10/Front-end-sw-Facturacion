# Scripts de Instalación
## Sistema de Facturación Electrónica - PFEPS

---

## 📋 Tabla de Contenidos

1. [Instalación Completa](#instalación-completa)
2. [Scripts de Base de Datos](#scripts-de-base-de-datos)
3. [Scripts de Configuración](#scripts-de-configuración)
4. [Scripts de Inicialización](#scripts-de-inicialización)
5. [Scripts de Migración](#scripts-de-migración)
6. [Troubleshooting](#troubleshooting)

---

## 🚀 1. Instalación Completa

### Script de Instalación Automática (Windows)

**Archivo**: `install-windows.bat`

```batch
@echo off
echo ============================================
echo  Sistema de Facturacion Electronica - PFEPS
echo  Script de Instalacion Automatica
echo ============================================
echo.

REM Verificar Node.js
echo [1/8] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta instalado
    echo Por favor instale Node.js desde https://nodejs.org/
    pause
    exit /b 1
)
echo OK: Node.js instalado

REM Verificar npm
echo [2/8] Verificando npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm no esta instalado
    pause
    exit /b 1
)
echo OK: npm instalado

REM Verificar MySQL
echo [3/8] Verificando MySQL...
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ADVERTENCIA: MySQL no esta en el PATH
    echo Asegurese de tener MySQL instalado y configurado
)

REM Instalar dependencias del proyecto
echo [4/8] Instalando dependencias del proyecto...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Fallo la instalacion de dependencias
    pause
    exit /b 1
)

REM Instalar dependencias de Playwright
echo [5/8] Instalando dependencias de Playwright...
cd playwright
call npm install
cd ..

REM Crear archivo .env si no existe
echo [6/8] Configurando variables de entorno...
if not exist "Backend\.env" (
    echo Creando archivo Backend\.env...
    (
        echo PORT=8080
        echo HOST=0.0.0.0
        echo.
        echo DB_HOST=localhost
        echo DB_USER=root
        echo DB_PASSWORD=
        echo DB_NAME=facturacion_db
        echo DB_PORT=3306
        echo.
        echo JWT_SECRET=cambiar_este_secret_por_uno_seguro
        echo JWT_EXPIRES_IN=24h
        echo.
        echo EMAIL_HOST=smtp.gmail.com
        echo EMAIL_PORT=587
        echo EMAIL_SECURE=false
        echo EMAIL_USER=tu_email@gmail.com
        echo EMAIL_PASSWORD=tu_app_password
        echo EMAIL_FROM=Sistema de Facturacion ^<tu_email@gmail.com^>
    ) > Backend\.env
    echo Archivo .env creado. Por favor edite Backend\.env con sus credenciales.
) else (
    echo Archivo .env ya existe.
)

REM Crear directorio para fotos de perfil
echo [7/8] Creando directorios necesarios...
if not exist "Front-End\src\Pictures\Profile" mkdir "Front-End\src\Pictures\Profile"
echo OK: Directorios creados

echo.
echo [8/8] Instalacion completada!
echo.
echo ============================================
echo  PROXIMOS PASOS:
echo ============================================
echo 1. Edite Backend\.env con sus credenciales
echo 2. Cree la base de datos ejecutando:
echo    mysql -u root -p ^< Backend\migrations\create_database.sql
echo 3. Ejecute las migraciones de la base de datos
echo 4. Inicie el backend: npm run s
echo 5. Inicie el frontend: npm run f
echo ============================================
echo.
pause
```

### Script de Instalación Automática (Linux/macOS)

**Archivo**: `install-unix.sh`

```bash
#!/bin/bash

echo "============================================"
echo "  Sistema de Facturación Electrónica - PFEPS"
echo "  Script de Instalación Automática"
echo "============================================"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar comandos
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}OK: $1 instalado${NC}"
        return 0
    else
        echo -e "${RED}ERROR: $1 no está instalado${NC}"
        return 1
    fi
}

# [1/8] Verificar Node.js
echo "[1/8] Verificando Node.js..."
if ! check_command node; then
    echo "Por favor instale Node.js desde https://nodejs.org/"
    exit 1
fi

# [2/8] Verificar npm
echo "[2/8] Verificando npm..."
if ! check_command npm; then
    echo "npm debería venir con Node.js"
    exit 1
fi

# [3/8] Verificar MySQL
echo "[3/8] Verificando MySQL..."
if ! check_command mysql; then
    echo -e "${YELLOW}ADVERTENCIA: MySQL no está en el PATH${NC}"
    echo "Asegúrese de tener MySQL instalado y configurado"
fi

# [4/8] Instalar dependencias del proyecto
echo "[4/8] Instalando dependencias del proyecto..."
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}ERROR: Falló la instalación de dependencias${NC}"
    exit 1
fi

# [5/8] Instalar dependencias de Playwright
echo "[5/8] Instalando dependencias de Playwright..."
cd playwright
npm install
cd ..

# [6/8] Crear archivo .env si no existe
echo "[6/8] Configurando variables de entorno..."
if [ ! -f "Backend/.env" ]; then
    echo "Creando archivo Backend/.env..."
    cat > Backend/.env << 'EOF'
PORT=8080
HOST=0.0.0.0

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=facturacion_db
DB_PORT=3306

JWT_SECRET=cambiar_este_secret_por_uno_seguro
JWT_EXPIRES_IN=24h

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_app_password
EMAIL_FROM=Sistema de Facturación <tu_email@gmail.com>
EOF
    echo -e "${YELLOW}Archivo .env creado. Por favor edite Backend/.env con sus credenciales.${NC}"
else
    echo "Archivo .env ya existe."
fi

# [7/8] Crear directorio para fotos de perfil
echo "[7/8] Creando directorios necesarios..."
mkdir -p Front-End/src/Pictures/Profile
echo -e "${GREEN}OK: Directorios creados${NC}"

echo ""
echo "[8/8] ¡Instalación completada!"
echo ""
echo "============================================"
echo "  PRÓXIMOS PASOS:"
echo "============================================"
echo "1. Edite Backend/.env con sus credenciales"
echo "2. Cree la base de datos ejecutando:"
echo "   mysql -u root -p < Backend/migrations/create_database.sql"
echo "3. Ejecute las migraciones de la base de datos"
echo "4. Inicie el backend: npm run s"
echo "5. Inicie el frontend: npm run f"
echo "============================================"
echo ""

# Hacer el script ejecutable
chmod +x "$0"
```

**Uso**:
```bash
# Dar permisos de ejecución
chmod +x install-unix.sh

# Ejecutar
./install-unix.sh
```

---

## 🗄️ 2. Scripts de Base de Datos

### 2.1 Script de Creación de Base de Datos

**Archivo**: `Backend/migrations/create_database.sql`

```sql
-- ============================================
-- Script de Creación de Base de Datos
-- Sistema de Facturación Electrónica - PFEPS
-- ============================================

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS facturacion_db 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE facturacion_db;

-- Mostrar confirmación
SELECT 'Base de datos "facturacion_db" creada exitosamente' AS Mensaje;
```

**Ejecución**:
```bash
mysql -u root -p < Backend/migrations/create_database.sql
```

### 2.2 Script de Creación de Tablas

**Archivo**: `Backend/migrations/create_all_tables.sql`

```sql
-- ============================================
-- Script de Creación de Todas las Tablas
-- Sistema de Facturación Electrónica - PFEPS
-- ============================================

USE facturacion_db;

-- ============================================
-- Tabla: users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    identification VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user', 'empleado') DEFAULT 'user',
    profile_photo VARCHAR(255) DEFAULT NULL,
    reset_token VARCHAR(255) DEFAULT NULL,
    reset_token_expires DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_users_email (email),
    INDEX idx_users_identification (identification),
    INDEX idx_users_reset_token (reset_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabla: clientes
-- ============================================
CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo_identificacion ENUM('Cedula', 'NIT', 'Pasaporte') NOT NULL,
    identificacion VARCHAR(50) UNIQUE NOT NULL,
    nombre_razon_social VARCHAR(255) NOT NULL,
    email VARCHAR(255) DEFAULT NULL,
    telefono VARCHAR(20) DEFAULT NULL,
    direccion TEXT DEFAULT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_clientes_identificacion (identificacion),
    INDEX idx_clientes_nombre (nombre_razon_social),
    INDEX idx_clientes_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabla: productos
-- ============================================
CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
    impuesto_porcentaje DECIMAL(5,2) DEFAULT 0.00 CHECK (impuesto_porcentaje >= 0 AND impuesto_porcentaje <= 100),
    descripcion TEXT DEFAULT 'Sin detalles',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_productos_codigo (codigo),
    INDEX idx_productos_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabla: facturas
-- ============================================
CREATE TABLE IF NOT EXISTS facturas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_factura VARCHAR(50) UNIQUE NOT NULL,
    cliente_id INT NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_emision DATETIME DEFAULT NULL,
    fecha_vencimiento DATE DEFAULT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    iva DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    estado ENUM('Pendiente', 'Pagada', 'Parcial', 'Vencida', 'Anulada') DEFAULT 'Pendiente',
    estado_emision ENUM('pendiente', 'emitida', 'error') DEFAULT 'pendiente',
    descuento_porcentaje DECIMAL(5,2) DEFAULT 0.00 CHECK (descuento_porcentaje >= 0 AND descuento_porcentaje <= 100),
    
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    
    INDEX idx_facturas_numero (numero_factura),
    INDEX idx_facturas_cliente (cliente_id),
    INDEX idx_facturas_fecha_creacion (fecha_creacion),
    INDEX idx_facturas_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabla: factura_detalles
-- ============================================
CREATE TABLE IF NOT EXISTS factura_detalles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    factura_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL,
    descuento DECIMAL(5,2) DEFAULT 0.00 CHECK (descuento >= 0 AND descuento <= 100),
    subtotal DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    
    FOREIGN KEY (factura_id) REFERENCES facturas(id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    
    INDEX idx_detalles_factura (factura_id),
    INDEX idx_detalles_producto (producto_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabla: reportes
-- ============================================
CREATE TABLE IF NOT EXISTS reportes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL CHECK (fecha_fin >= fecha_inicio),
    contenido JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_reportes_tipo (tipo),
    INDEX idx_reportes_fecha (fecha_inicio, fecha_fin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Confirmación
-- ============================================
SELECT 'Todas las tablas creadas exitosamente' AS Mensaje;

-- Mostrar tablas creadas
SHOW TABLES;
```

**Ejecución**:
```bash
mysql -u root -p facturacion_db < Backend/migrations/create_all_tables.sql
```

### 2.3 Script de Datos de Prueba (Opcional)

**Archivo**: `Backend/migrations/seed_data.sql`

```sql
-- ============================================
-- Script de Datos de Prueba
-- Sistema de Facturación Electrónica - PFEPS
-- ============================================

USE facturacion_db;

-- Limpiar datos existentes (CUIDADO: Solo para desarrollo)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE factura_detalles;
TRUNCATE TABLE facturas;
TRUNCATE TABLE clientes;
TRUNCATE TABLE productos;
TRUNCATE TABLE users;
TRUNCATE TABLE reportes;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- Insertar Usuarios de Prueba
-- ============================================
-- Contraseña para todos: "password123"
-- Hash bcrypt con salt rounds = 10
INSERT INTO users (name, identification, email, password, role) VALUES
('Administrador Sistema', '1234567890', 'admin@sistema.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('Juan Pérez', '9876543210', 'juan.perez@empresa.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'empleado'),
('María García', '5555555555', 'maria.garcia@empresa.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user');

-- ============================================
-- Insertar Clientes de Prueba
-- ============================================
INSERT INTO clientes (tipo_identificacion, identificacion, nombre_razon_social, email, telefono, direccion) VALUES
('NIT', '900123456-7', 'Empresa ABC S.A.S.', 'contacto@empresaabc.com', '3001234567', 'Calle 123 #45-67'),
('Cedula', '1020304050', 'Pedro Rodríguez', 'pedro.rodriguez@email.com', '3109876543', 'Carrera 10 #20-30'),
('NIT', '800987654-3', 'Distribuidora XYZ Ltda', 'ventas@xyz.com', '3201112233', 'Avenida 50 #12-34'),
('Cedula', '4050607080', 'Ana Martínez', 'ana.martinez@email.com', '3154445566', 'Transversal 5 #8-9'),
('Pasaporte', 'AB123456', 'John Smith', 'john.smith@international.com', '3187778899', 'Zona Franca Local 10');

-- ============================================
-- Insertar Productos de Prueba
-- ============================================
INSERT INTO productos (codigo, nombre, precio, impuesto_porcentaje, descripcion) VALUES
('PROD001', 'Laptop Dell Inspiron 15', 2500000.00, 19.00, 'Laptop con procesador Intel Core i5, 8GB RAM, 512GB SSD'),
('PROD002', 'Mouse Inalámbrico Logitech', 45000.00, 19.00, 'Mouse ergonómico con conexión USB'),
('PROD003', 'Teclado Mecánico', 180000.00, 19.00, 'Teclado mecánico RGB con switches Cherry MX'),
('SERV001', 'Consultoría Técnica (Hora)', 150000.00, 0.00, 'Servicio de consultoría técnica especializada'),
('PROD004', 'Monitor 24 Pulgadas', 650000.00, 19.00, 'Monitor Full HD 1920x1080, 75Hz'),
('PROD005', 'Cable HDMI 2m', 25000.00, 19.00, 'Cable HDMI 2.0 de alta velocidad'),
('PROD006', 'Silla Ergonómica', 450000.00, 19.00, 'Silla de oficina con soporte lumbar'),
('SERV002', 'Instalación de Software', 80000.00, 0.00, 'Servicio de instalación y configuración'),
('PROD007', 'Memoria USB 64GB', 35000.00, 19.00, 'Memoria USB 3.0 de 64GB'),
('PROD008', 'Webcam HD 1080p', 120000.00, 19.00, 'Cámara web Full HD con micrófono integrado');

-- ============================================
-- Insertar Facturas de Prueba
-- ============================================
-- Factura 1: Empresa ABC
INSERT INTO facturas (numero_factura, cliente_id, fecha_creacion, fecha_vencimiento, subtotal, iva, total, estado, estado_emision) 
VALUES ('FACT-0001', 1, NOW(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 2797000.00, 531430.00, 3328430.00, 'Pagada', 'emitida');

INSERT INTO factura_detalles (factura_id, producto_id, cantidad, precio_unitario, descuento, subtotal, total) VALUES
(1, 1, 1, 2500000.00, 0.00, 2500000.00, 2975000.00),
(1, 5, 1, 650000.00, 10.00, 585000.00, 696150.00);

-- Factura 2: Pedro Rodríguez
INSERT INTO facturas (numero_factura, cliente_id, fecha_creacion, fecha_vencimiento, subtotal, iva, total, estado) 
VALUES ('FACT-0002', 2, NOW(), DATE_ADD(CURDATE(), INTERVAL 15 DAY), 225000.00, 42750.00, 267750.00, 'Pendiente');

INSERT INTO factura_detalles (factura_id, producto_id, cantidad, precio_unitario, descuento, subtotal, total) VALUES
(2, 2, 2, 45000.00, 0.00, 90000.00, 107100.00),
(2, 3, 1, 180000.00, 5.00, 171000.00, 203490.00);

-- Factura 3: Distribuidora XYZ
INSERT INTO facturas (numero_factura, cliente_id, fecha_creacion, fecha_vencimiento, subtotal, iva, total, estado, estado_emision) 
VALUES ('FACT-0003', 3, DATE_SUB(NOW(), INTERVAL 45 DAY), DATE_SUB(CURDATE(), INTERVAL 15 DAY), 450000.00, 85500.00, 535500.00, 'Vencida', 'emitida');

INSERT INTO factura_detalles (factura_id, producto_id, cantidad, precio_unitario, descuento, subtotal, total) VALUES
(3, 7, 1, 450000.00, 0.00, 450000.00, 535500.00);

-- ============================================
-- Confirmación
-- ============================================
SELECT 'Datos de prueba insertados exitosamente' AS Mensaje;
SELECT 
    (SELECT COUNT(*) FROM users) AS usuarios,
    (SELECT COUNT(*) FROM clientes) AS clientes,
    (SELECT COUNT(*) FROM productos) AS productos,
    (SELECT COUNT(*) FROM facturas) AS facturas,
    (SELECT COUNT(*) FROM factura_detalles) AS detalles_facturas;
```

**Ejecución**:
```bash
mysql -u root -p facturacion_db < Backend/migrations/seed_data.sql
```

---

## ⚙️ 3. Scripts de Configuración

### 3.1 Script de Validación de Instalación

**Archivo**: `scripts/validate-installation.js`

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Validando instalación del sistema...\n');

const checks = [];

// Verificar package.json
checks.push({
  name: 'package.json',
  check: () => fs.existsSync('package.json'),
  message: 'Archivo package.json existe'
});

// Verificar node_modules
checks.push({
  name: 'node_modules',
  check: () => fs.existsSync('node_modules'),
  message: 'Dependencias instaladas'
});

// Verificar Backend/.env
checks.push({
  name: 'Backend/.env',
  check: () => fs.existsSync('Backend/.env'),
  message: 'Archivo de configuración Backend/.env existe',
  warning: 'Archivo .env no encontrado. El sistema no funcionará sin configuración.'
});

// Verificar estructura de directorios
const dirs = [
  'Backend/config',
  'Backend/controllers',
  'Backend/middleware',
  'Backend/models',
  'Backend/routes',
  'Backend/migrations',
  'Front-End/src',
  'Front-End/src/Auth',
  'Front-End/src/components',
  'Front-End/src/modules',
  'Front-End/src/Pictures/Profile'
];

dirs.forEach(dir => {
  checks.push({
    name: dir,
    check: () => fs.existsSync(dir),
    message: `Directorio ${dir} existe`
  });
});

// Ejecutar validaciones
let passed = 0;
let failed = 0;
let warnings = 0;

checks.forEach(check => {
  const result = check.check();
  if (result) {
    console.log(`✅ ${check.message}`);
    passed++;
  } else {
    if (check.warning) {
      console.log(`⚠️  ${check.warning}`);
      warnings++;
    } else {
      console.log(`❌ ${check.name} no encontrado`);
      failed++;
    }
  }
});

console.log(`\n📊 Resultados: ${passed} OK, ${failed} Error(es), ${warnings} Advertencia(s)\n`);

if (failed > 0) {
  console.log('❌ La instalación está incompleta. Por favor ejecute el script de instalación.');
  process.exit(1);
} else if (warnings > 0) {
  console.log('⚠️  La instalación tiene advertencias. Revise la configuración.');
  process.exit(0);
} else {
  console.log('✅ ¡Instalación completa y válida!');
  process.exit(0);
}
```

**Uso**:
```bash
node scripts/validate-installation.js
```

### 3.2 Script de Generación de JWT Secret

**Archivo**: `scripts/generate-jwt-secret.js`

```javascript
#!/usr/bin/env node

const crypto = require('crypto');

// Generar secret aleatorio de 64 bytes (512 bits)
const secret = crypto.randomBytes(64).toString('hex');

console.log('🔐 JWT Secret generado:\n');
console.log(secret);
console.log('\n📝 Copie este valor en Backend/.env como JWT_SECRET=...\n');
```

**Uso**:
```bash
node scripts/generate-jwt-secret.js
```

---

## 🔄 4. Scripts de Inicialización

### 4.1 Script de Inicio del Sistema (Development)

**Archivo**: `scripts/start-dev.bat` (Windows)

```batch
@echo off
title Sistema de Facturacion - Development

echo ============================================
echo  Iniciando Sistema de Facturacion
echo ============================================
echo.

echo [1/2] Iniciando Backend en puerto 8080...
start "Backend Server" cmd /k "npm run s"
timeout /t 5 /nobreak >nul

echo [2/2] Iniciando Frontend en puerto 5173...
start "Frontend Server" cmd /k "npm run f"

echo.
echo ============================================
echo  Sistema iniciado en modo desarrollo
echo  Backend: http://localhost:8080
echo  Frontend: http://localhost:5173
echo ============================================
```

**Archivo**: `scripts/start-dev.sh` (Linux/macOS)

```bash
#!/bin/bash

echo "============================================"
echo "  Iniciando Sistema de Facturación"
echo "============================================"
echo ""

echo "[1/2] Iniciando Backend en puerto 8080..."
npm run s &
BACKEND_PID=$!

sleep 5

echo "[2/2] Iniciando Frontend en puerto 5173..."
npm run f &
FRONTEND_PID=$!

echo ""
echo "============================================"
echo "  Sistema iniciado en modo desarrollo"
echo "  Backend: http://localhost:8080"
echo "  Frontend: http://localhost:5173"
echo "  Backend PID: $BACKEND_PID"
echo "  Frontend PID: $FRONTEND_PID"
echo "============================================"
echo ""
echo "Presione Ctrl+C para detener ambos servicios"

# Esperar a que se presione Ctrl+C
wait
```

**Uso**:
```bash
# Windows
scripts\start-dev.bat

# Linux/macOS
chmod +x scripts/start-dev.sh
./scripts/start-dev.sh
```

---

## 🔧 5. Scripts de Migración

### Ejecutar Todas las Migraciones

**Archivo**: `scripts/run-migrations.sh`

```bash
#!/bin/bash

echo "============================================"
echo "  Ejecutando Migraciones de Base de Datos"
echo "============================================"
echo ""

# Solicitar credenciales
read -p "Usuario MySQL: " DB_USER
read -sp "Contraseña MySQL: " DB_PASSWORD
echo ""
read -p "Base de datos: " DB_NAME

MIGRATIONS_DIR="Backend/migrations"

# Verificar que el directorio existe
if [ ! -d "$MIGRATIONS_DIR" ]; then
    echo "❌ Error: Directorio de migraciones no encontrado"
    exit 1
fi

# Ejecutar cada archivo SQL
for file in $MIGRATIONS_DIR/*.sql; do
    if [ -f "$file" ]; then
        echo "📄 Ejecutando: $(basename $file)"
        mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$file"
        
        if [ $? -eq 0 ]; then
            echo "✅ $(basename $file) ejecutado exitosamente"
        else
            echo "❌ Error al ejecutar $(basename $file)"
            exit 1
        fi
        echo ""
    fi
done

echo "============================================"
echo "  ✅ Todas las migraciones completadas"
echo "============================================"
```

**Uso**:
```bash
chmod +x scripts/run-migrations.sh
./scripts/run-migrations.sh
```

---

## 🔍 6. Troubleshooting

### Script de Diagnóstico

**Archivo**: `scripts/diagnose.js`

```javascript
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🏥 Diagnóstico del Sistema\n');

const diagnostics = [];

// Verificar Node.js
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  diagnostics.push({ ok: true, msg: `Node.js: ${nodeVersion}` });
} catch (e) {
  diagnostics.push({ ok: false, msg: 'Node.js no instalado' });
}

// Verificar npm
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  diagnostics.push({ ok: true, msg: `npm: ${npmVersion}` });
} catch (e) {
  diagnostics.push({ ok: false, msg: 'npm no instalado' });
}

// Verificar MySQL
try {
  const mysqlVersion = execSync('mysql --version', { encoding: 'utf8' }).trim();
  diagnostics.push({ ok: true, msg: `MySQL: ${mysqlVersion}` });
} catch (e) {
  diagnostics.push({ ok: false, msg: 'MySQL no encontrado en PATH' });
}

// Verificar .env
if (fs.existsSync('Backend/.env')) {
  diagnostics.push({ ok: true, msg: 'Archivo Backend/.env existe' });
  
  // Leer y verificar variables críticas
  const envContent = fs.readFileSync('Backend/.env', 'utf8');
  const criticalVars = ['DB_NAME', 'DB_USER', 'JWT_SECRET'];
  
  criticalVars.forEach(varName => {
    if (envContent.includes(varName)) {
      diagnostics.push({ ok: true, msg: `  ✓ ${varName} configurado` });
    } else {
      diagnostics.push({ ok: false, msg: `  ✗ ${varName} no configurado` });
    }
  });
} else {
  diagnostics.push({ ok: false, msg: 'Archivo Backend/.env NO existe' });
}

// Verificar node_modules
if (fs.existsSync('node_modules')) {
  diagnostics.push({ ok: true, msg: 'Dependencias instaladas (node_modules existe)' });
} else {
  diagnostics.push({ ok: false, msg: 'Dependencias NO instaladas' });
}

// Verificar puertos
const checkPort = (port) => {
  try {
    execSync(`netstat -an | grep ${port}`, { encoding: 'utf8' });
    return true;
  } catch (e) {
    return false;
  }
};

if (checkPort(8080)) {
  diagnostics.push({ ok: false, msg: 'Puerto 8080 en uso (Backend)' });
} else {
  diagnostics.push({ ok: true, msg: 'Puerto 8080 disponible' });
}

if (checkPort(5173)) {
  diagnostics.push({ ok: false, msg: 'Puerto 5173 en uso (Frontend)' });
} else {
  diagnostics.push({ ok: true, msg: 'Puerto 5173 disponible' });
}

// Mostrar resultados
diagnostics.forEach(d => {
  console.log(d.ok ? `✅ ${d.msg}` : `❌ ${d.msg}`);
});

const errors = diagnostics.filter(d => !d.ok).length;
console.log(`\n📊 ${diagnostics.length - errors} OK, ${errors} Problemas\n`);

if (errors > 0) {
  console.log('💡 Recomendaciones:');
  console.log('   1. Ejecute: npm install');
  console.log('   2. Configure Backend/.env');
  console.log('   3. Verifique que MySQL esté instalado');
  console.log('   4. Libere puertos 8080 y 5173 si están en uso\n');
}
```

**Uso**:
```bash
node scripts/diagnose.js
```

---

## 📝 Resumen de Scripts Disponibles

### NPM Scripts (package.json)

| Script | Comando | Descripción |
|--------|---------|-------------|
| `npm run f` | `vite --host --open` | Inicia frontend en desarrollo |
| `npm run s` | `nodemon Backend/server.js` | Inicia backend con auto-reload |
| `npm start` | `node Backend/server.js` | Inicia backend en producción |
| `npm run build` | `vite build` | Construye frontend para producción |
| `npm run test:e2e` | Playwright tests | Ejecuta pruebas E2E |

### Scripts de Sistema

| Script | Plataforma | Propósito |
|--------|-----------|-----------|
| `install-windows.bat` | Windows | Instalación automática |
| `install-unix.sh` | Linux/macOS | Instalación automática |
| `start-dev.bat/.sh` | Ambas | Inicio en desarrollo |
| `validate-installation.js` | Node.js | Validar instalación |
| `diagnose.js` | Node.js | Diagnóstico de problemas |
| `generate-jwt-secret.js` | Node.js | Generar JWT secret |

---

**Documento creado**: Enero 2026  
**Versión**: 1.0  
**Sistema**: Facturación Electrónica PFEPS
