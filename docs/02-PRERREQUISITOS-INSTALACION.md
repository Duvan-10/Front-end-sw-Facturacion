# Prerrequisitos de Instalación del Sistema
## Sistema de Facturación Electrónica - PFEPS

---

## 📋 Tabla de Contenidos

1. [Requisitos de Hardware](#requisitos-de-hardware)
2. [Requisitos de Software](#requisitos-de-software)
3. [Dependencias del Sistema](#dependencias-del-sistema)
4. [Configuración de Base de Datos](#configuración-de-base-de-datos)
5. [Configuración de Entorno](#configuración-de-entorno)
6. [Verificación de Prerrequisitos](#verificación-de-prerrequisitos)

---

## 💻 1. Requisitos de Hardware

### Mínimos
| Componente | Especificación |
|------------|----------------|
| Procesador | Intel Core i3 / AMD Ryzen 3 o superior |
| RAM | 4 GB |
| Almacenamiento | 2 GB de espacio libre |
| Conexión | Internet para instalación de dependencias |

### Recomendados
| Componente | Especificación |
|------------|----------------|
| Procesador | Intel Core i5 / AMD Ryzen 5 o superior |
| RAM | 8 GB o más |
| Almacenamiento | 5 GB de espacio libre (SSD recomendado) |
| Conexión | Internet estable para envío de emails |

---

## 🖥️ 2. Requisitos de Software

### 2.1 Sistema Operativo

El sistema es multiplataforma y funciona en:

- ✅ **Windows** 10/11 (64-bit)
- ✅ **macOS** 10.15 Catalina o superior
- ✅ **Linux** (Ubuntu 20.04+, Debian 10+, CentOS 8+)

### 2.2 Node.js

**Versión requerida**: Node.js >= 18.x

**Incluye**:
- npm >= 9.x (gestor de paquetes)

**Descarga**: [https://nodejs.org/](https://nodejs.org/)

**Verificación**:
```bash
node --version  # Debe mostrar v18.x.x o superior
npm --version   # Debe mostrar 9.x.x o superior
```

### 2.3 MySQL

**Versión requerida**: MySQL >= 8.0

**Características necesarias**:
- Soporte para JSON
- Soporte para transacciones InnoDB
- Charset: utf8mb4

**Descarga**: [https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/)

**Alternativas compatibles**:
- MariaDB >= 10.5

**Verificación**:
```bash
mysql --version  # Debe mostrar 8.0.x o superior
```

### 2.4 Git (Opcional pero recomendado)

**Versión**: Git >= 2.x

**Descarga**: [https://git-scm.com/](https://git-scm.com/)

**Uso**: Para clonar el repositorio y control de versiones

**Verificación**:
```bash
git --version  # Debe mostrar git version 2.x.x
```

### 2.5 Editor de Código (Opcional)

**Recomendado**: Visual Studio Code

**Descarga**: [https://code.visualstudio.com/](https://code.visualstudio.com/)

**Extensiones útiles**:
- ESLint
- Prettier
- MySQL (para gestión de BD)

---

## 📦 3. Dependencias del Sistema

### 3.1 Dependencias de Backend (Node.js)

El sistema instalará automáticamente las siguientes dependencias al ejecutar `npm install`:

#### Dependencias de Producción

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| express | ^5.2.1 | Framework web para API REST |
| mysql2 | ^3.15.3 | Cliente MySQL con soporte para promises |
| bcryptjs | ^3.0.3 | Encriptación de contraseñas |
| jsonwebtoken | ^9.0.3 | Autenticación mediante JWT |
| cors | ^2.8.5 | Habilitación de CORS |
| dotenv | ^17.2.3 | Gestión de variables de entorno |
| nodemailer | ^7.0.12 | Envío de emails |
| multer | ^2.0.2 | Subida de archivos (fotos de perfil) |
| puppeteer | ^24.35.0 | Generación de PDFs de facturas |
| axios | ^1.13.2 | Cliente HTTP |
| xlsx | ^0.18.5 | Exportación a Excel (reportes) |
| @react-pdf/renderer | ^4.3.1 | Generación de PDFs con React |
| html2pdf.js | ^0.12.1 | Conversión HTML a PDF |

#### Dependencias de Desarrollo

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| nodemon | ^3.1.11 | Reinicio automático del servidor |
| eslint | ^9.39.1 | Linter para JavaScript |
| vite | ^7.2.4 | Build tool para frontend |
| @vitejs/plugin-react | ^5.1.1 | Plugin React para Vite |

### 3.2 Dependencias de Frontend (React)

El frontend se gestiona mediante Vite e incluye:

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| react | ^19.2.0 | Librería de UI |
| react-dom | ^19.2.0 | Renderizado de React |
| react-router-dom | ^7.10.1 | Enrutamiento SPA |
| react-icons | ^5.5.0 | Iconos |
| lucide-react | ^0.562.0 | Iconos adicionales |

### 3.3 Dependencias de Testing

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| @playwright/test | ^1.57.0 | Framework de testing E2E |

---

## 🗄️ 4. Configuración de Base de Datos

### 4.1 Instalación de MySQL

#### Windows
1. Descargar MySQL Installer desde [mysql.com](https://dev.mysql.com/downloads/installer/)
2. Ejecutar el instalador
3. Seleccionar "Developer Default" o "Server only"
4. Configurar contraseña de root durante la instalación
5. Completar la instalación

#### macOS
```bash
# Usando Homebrew
brew install mysql
brew services start mysql
mysql_secure_installation
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo mysql_secure_installation
```

### 4.2 Creación de la Base de Datos

Una vez instalado MySQL, crear la base de datos:

```bash
# Conectar a MySQL
mysql -u root -p

# Crear la base de datos
CREATE DATABASE facturacion_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Crear usuario (opcional pero recomendado)
CREATE USER 'facturacion_user'@'localhost' IDENTIFIED BY 'tu_password_seguro';

# Otorgar privilegios
GRANT ALL PRIVILEGES ON facturacion_db.* TO 'facturacion_user'@'localhost';
FLUSH PRIVILEGES;

# Salir
EXIT;
```

### 4.3 Estructura de Tablas

El sistema creará automáticamente las siguientes tablas:

#### Tabla: `users`
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    identification VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user', 'empleado') DEFAULT 'user',
    profile_photo VARCHAR(255) DEFAULT NULL,
    reset_token VARCHAR(255) DEFAULT NULL,
    reset_token_expires DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabla: `clientes`
```sql
CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo_identificacion ENUM('Cedula', 'NIT', 'Pasaporte') NOT NULL,
    identificacion VARCHAR(50) UNIQUE NOT NULL,
    nombre_razon_social VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefono VARCHAR(20),
    direccion TEXT,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabla: `productos`
```sql
CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    impuesto_porcentaje DECIMAL(5, 2) DEFAULT 0,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabla: `facturas`
```sql
CREATE TABLE facturas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_factura VARCHAR(50) UNIQUE NOT NULL,
    cliente_id INT NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_emision DATETIME,
    fecha_vencimiento DATE,
    subtotal DECIMAL(10, 2) NOT NULL,
    iva DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    estado ENUM('Pendiente', 'Pagada', 'Parcial', 'Vencida', 'Anulada') DEFAULT 'Pendiente',
    estado_emision ENUM('pendiente', 'emitida', 'error') DEFAULT 'pendiente',
    descuento_porcentaje DECIMAL(5,2) DEFAULT 0,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);
```

#### Tabla: `factura_detalles`
```sql
CREATE TABLE factura_detalles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    factura_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    descuento DECIMAL(5, 2) DEFAULT 0,
    subtotal DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (factura_id) REFERENCES facturas(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);
```

#### Tabla: `reportes`
```sql
CREATE TABLE reportes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    contenido JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4.4 Migraciones Disponibles

El sistema incluye archivos de migración en `/Backend/migrations/`:

1. **add_fecha_vencimiento_tipo_pago_descuento.sql**: Agrega fecha de vencimiento y descuentos
2. **add_descuento_porcentaje.sql**: Agrega descuento porcentual a nivel factura
3. **add_estado_emision.sql**: Agrega estado de emisión de facturas
4. **add_password_reset_fields.sql**: Agrega campos para recuperación de contraseña
5. **add_profile_photo.sql**: Agrega campo de foto de perfil
6. **create_reportes_table.sql**: Crea tabla de reportes

**Ejecución**:
```bash
mysql -u root -p facturacion_db < Backend/migrations/nombre_archivo.sql
```

---

## ⚙️ 5. Configuración de Entorno

### 5.1 Variables de Entorno del Backend

Crear archivo `Backend/.env`:

```env
# Configuración del Servidor
PORT=8080
HOST=0.0.0.0

# Configuración de Base de Datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=facturacion_db
DB_PORT=3306

# Configuración de Autenticación
JWT_SECRET=tu_clave_secreta_muy_segura_y_larga
JWT_EXPIRES_IN=24h

# Configuración de Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_app_password
EMAIL_FROM=Sistema de Facturación <tu_email@gmail.com>

# Configuración de Archivos
UPLOAD_DIR=./Pictures/Profile
```

### 5.2 Variables de Entorno del Frontend

Crear archivo `Front-End/.env`:

```env
# URL de la API Backend
VITE_API_URL=http://localhost:8080

# Configuración de Vite
VITE_PORT=5173
```

### 5.3 Configuración de Email (Gmail)

Para usar Gmail como servidor SMTP:

1. Habilitar verificación en 2 pasos en tu cuenta de Google
2. Generar una "Contraseña de aplicación":
   - Ir a [myaccount.google.com/security](https://myaccount.google.com/security)
   - Buscar "Contraseñas de aplicación"
   - Crear una nueva para "Correo"
3. Usar esa contraseña en `EMAIL_PASSWORD`

**Alternativas**: Outlook, SendGrid, Mailgun, etc.

---

## ✅ 6. Verificación de Prerrequisitos

### Script de Verificación Automática

Crear archivo `check-prerequisites.js`:

```javascript
#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔍 Verificando prerrequisitos del sistema...\n');

const checks = [
  {
    name: 'Node.js',
    command: 'node --version',
    minVersion: '18.0.0',
    pattern: /v(\d+\.\d+\.\d+)/
  },
  {
    name: 'npm',
    command: 'npm --version',
    minVersion: '9.0.0',
    pattern: /(\d+\.\d+\.\d+)/
  },
  {
    name: 'MySQL',
    command: 'mysql --version',
    minVersion: '8.0.0',
    pattern: /(\d+\.\d+\.\d+)/
  }
];

let allPassed = true;

checks.forEach(check => {
  try {
    const output = execSync(check.command, { encoding: 'utf8' });
    const match = output.match(check.pattern);
    
    if (match) {
      const version = match[1];
      const passed = compareVersions(version, check.minVersion) >= 0;
      
      console.log(`${passed ? '✅' : '❌'} ${check.name}: ${version} ${passed ? '' : `(Requiere >= ${check.minVersion})`}`);
      
      if (!passed) allPassed = false;
    }
  } catch (error) {
    console.log(`❌ ${check.name}: No instalado`);
    allPassed = false;
  }
});

console.log(`\n${allPassed ? '✅ Todos los prerrequisitos están cumplidos' : '❌ Algunos prerrequisitos no están cumplidos'}`);

function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < 3; i++) {
    if (parts1[i] > parts2[i]) return 1;
    if (parts1[i] < parts2[i]) return -1;
  }
  return 0;
}
```

**Ejecución**:
```bash
node check-prerequisites.js
```

### Checklist Manual

- [ ] Node.js >= 18.x instalado
- [ ] npm >= 9.x instalado
- [ ] MySQL >= 8.0 instalado
- [ ] Base de datos `facturacion_db` creada
- [ ] Usuario de BD con permisos configurado
- [ ] Archivo `Backend/.env` creado y configurado
- [ ] Archivo `Front-End/.env` creado (opcional)
- [ ] Puerto 8080 disponible para backend
- [ ] Puerto 5173 disponible para frontend
- [ ] Conexión a internet disponible
- [ ] Configuración de email completada (si se usará emisión de facturas)

---

## 🚨 Solución de Problemas Comunes

### Problema: MySQL no se conecta

**Solución**:
```bash
# Verificar que MySQL está corriendo
# Windows
net start MySQL80

# macOS/Linux
sudo systemctl status mysql
```

### Problema: Puerto 8080 ya en uso

**Solución**: Cambiar el puerto en `Backend/.env`:
```env
PORT=8081
```

### Problema: Error de permisos en MySQL

**Solución**:
```sql
GRANT ALL PRIVILEGES ON facturacion_db.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

### Problema: Módulos de Node.js no se instalan

**Solución**:
```bash
# Limpiar caché de npm
npm cache clean --force

# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Referencias

- [Node.js Documentation](https://nodejs.org/docs/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Express Documentation](https://expressjs.com/)

---

**Documento creado**: Enero 2026  
**Versión**: 1.0  
**Sistema**: Facturación Electrónica PFEPS
