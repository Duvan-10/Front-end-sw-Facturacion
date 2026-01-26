# Frameworks y Estándares del Sistema
## Sistema de Facturación Electrónica - PFEPS

---

## 📋 Tabla de Contenidos

1. [Arquitectura General](#arquitectura-general)
2. [Tecnologías Backend](#tecnologías-backend)
3. [Tecnologías Frontend](#tecnologías-frontend)
4. [Base de Datos](#base-de-datos)
5. [Estándares de Desarrollo](#estándares-de-desarrollo)
6. [Herramientas de Testing](#herramientas-de-testing)
7. [Patrones de Diseño](#patrones-de-diseño)

---

## 🏗️ 1. Arquitectura General

### 1.1 Tipo de Arquitectura

**Arquitectura de Tres Capas (Three-Tier Architecture)**

```
┌─────────────────────────────────────┐
│     CAPA DE PRESENTACIÓN            │
│  (Frontend - React + Vite)          │
│  Puerto: 5173                       │
└─────────────────┬───────────────────┘
                  │ HTTP/REST
                  │ (JSON)
┌─────────────────▼───────────────────┐
│     CAPA DE NEGOCIO                 │
│  (Backend - Node.js + Express)      │
│  Puerto: 8080                       │
└─────────────────┬───────────────────┘
                  │ SQL
                  │ (MySQL2 Driver)
┌─────────────────▼───────────────────┐
│     CAPA DE DATOS                   │
│  (MySQL Database)                   │
│  Puerto: 3306                       │
└─────────────────────────────────────┘
```

### 1.2 Patrón de Comunicación

**RESTful API**
- Protocolo HTTP/HTTPS
- Formato de intercambio: JSON
- Autenticación: JWT (JSON Web Tokens)
- Verbos HTTP: GET, POST, PUT, DELETE

---

## 🔧 2. Tecnologías Backend

### 2.1 Entorno de Ejecución

#### Node.js v18.x
- **Versión**: 18.x LTS
- **Propósito**: Entorno de ejecución JavaScript del lado del servidor
- **Características utilizadas**:
  - ES Modules (import/export)
  - Async/Await
  - File System API
  - Path module
- **Documentación**: [nodejs.org](https://nodejs.org/)

### 2.2 Framework Web

#### Express.js v5.2.1
- **Tipo**: Framework web minimalista para Node.js
- **Propósito**: Manejo de rutas, middleware y API REST
- **Características utilizadas**:
  - Enrutamiento modular
  - Middleware chain
  - Manejo de JSON
  - Servir archivos estáticos
  - CORS habilitado
- **Documentación**: [expressjs.com](https://expressjs.com/)

**Estructura de Rutas**:
```
/api/auth        - Autenticación (login, registro, recuperación)
/api/users       - Gestión de usuarios (solo admin)
/api/clientes    - Gestión de clientes
/api/productos   - Gestión de productos
/api/facturas    - Gestión de facturas
/api/perfil      - Gestión de perfil de usuario
/api/reportes    - Generación de reportes
```

### 2.3 Base de Datos

#### MySQL2 v3.15.3
- **Tipo**: Cliente MySQL para Node.js
- **Propósito**: Conexión y consultas a base de datos
- **Características utilizadas**:
  - Promise-based API
  - Connection pooling
  - Prepared statements (prevención de SQL injection)
  - Transacciones
- **Documentación**: [sidorares.github.io/node-mysql2](https://sidorares.github.io/node-mysql2/)

**Configuración de Pool**:
```javascript
{
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0
}
```

### 2.4 Seguridad y Autenticación

#### bcryptjs v3.0.3
- **Propósito**: Encriptación de contraseñas
- **Algoritmo**: bcrypt con salt rounds = 10
- **Uso**: Hash de contraseñas antes de almacenar en BD
- **Documentación**: [github.com/dcodeIO/bcrypt.js](https://github.com/dcodeIO/bcrypt.js)

#### jsonwebtoken v9.0.3
- **Propósito**: Autenticación stateless mediante tokens
- **Algoritmo**: HS256 (HMAC SHA-256)
- **Contenido del token**:
  ```json
  {
    "id": 1,
    "email": "user@example.com",
    "role": "admin",
    "iat": 1234567890,
    "exp": 1234654290
  }
  ```
- **Duración**: Configurable (default: 24h)
- **Documentación**: [jwt.io](https://jwt.io/)

#### CORS v2.8.5
- **Propósito**: Habilitar Cross-Origin Resource Sharing
- **Configuración**: Permite todas las origins en desarrollo
- **Documentación**: [github.com/expressjs/cors](https://github.com/expressjs/cors)

### 2.5 Gestión de Configuración

#### dotenv v17.2.3
- **Propósito**: Cargar variables de entorno desde archivos .env
- **Ubicación**: `Backend/.env`
- **Variables gestionadas**:
  - Configuración de BD
  - Secretos JWT
  - Configuración de email
  - Puertos del servidor
- **Documentación**: [github.com/motdotla/dotenv](https://github.com/motdotla/dotenv)

### 2.6 Envío de Emails

#### Nodemailer v7.0.12
- **Propósito**: Envío de emails con facturas adjuntas
- **Protocolo**: SMTP
- **Proveedores soportados**: Gmail, Outlook, SMTP personalizado
- **Características utilizadas**:
  - Envío de HTML
  - Archivos adjuntos (PDFs)
  - Templates personalizados
- **Documentación**: [nodemailer.com](https://nodemailer.com/)

**Configuración típica**:
```javascript
{
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
}
```

### 2.7 Generación de PDFs

#### Puppeteer v24.35.0
- **Propósito**: Generación de PDFs de facturas
- **Motor**: Chromium headless
- **Características utilizadas**:
  - Renderizado de HTML a PDF
  - Formato A4
  - Estilos CSS completos
  - Impresión de fondo
- **Documentación**: [pptr.dev](https://pptr.dev/)

#### @react-pdf/renderer v4.3.1
- **Propósito**: Generación alternativa de PDFs con React
- **Tipo**: Librería declarativa para PDFs
- **Documentación**: [react-pdf.org](https://react-pdf.org/)

#### html2pdf.js v0.12.1
- **Propósito**: Conversión de HTML a PDF en el navegador
- **Uso**: Vista previa de facturas en frontend
- **Documentación**: [ekoopmans.github.io/html2pdf.js](https://ekoopmans.github.io/html2pdf.js/)

### 2.8 Subida de Archivos

#### Multer v2.0.2
- **Propósito**: Manejo de subida de archivos multipart/form-data
- **Uso**: Subida de fotos de perfil
- **Almacenamiento**: Sistema de archivos local
- **Validaciones**: Tipo de archivo, tamaño máximo
- **Documentación**: [github.com/expressjs/multer](https://github.com/expressjs/multer)

### 2.9 Exportación de Datos

#### xlsx v0.18.5
- **Propósito**: Generación de archivos Excel
- **Uso**: Exportación de reportes
- **Formatos soportados**: .xlsx, .xls, .csv
- **Documentación**: [sheetjs.com](https://sheetjs.com/)

### 2.10 Cliente HTTP

#### Axios v1.13.2
- **Propósito**: Cliente HTTP para comunicación con APIs externas
- **Características**:
  - Promise-based
  - Interceptors
  - Cancelación de peticiones
- **Documentación**: [axios-http.com](https://axios-http.com/)

### 2.11 Herramientas de Desarrollo

#### Nodemon v3.1.11
- **Propósito**: Reinicio automático del servidor en desarrollo
- **Configuración**: Observa cambios en archivos .js
- **Documentación**: [nodemon.io](https://nodemon.io/)

---

## 🎨 3. Tecnologías Frontend

### 3.1 Librería de UI

#### React v19.2.0
- **Tipo**: Librería JavaScript para interfaces de usuario
- **Paradigma**: Component-based, declarativo
- **Características utilizadas**:
  - Hooks (useState, useEffect, useContext, useNavigate)
  - Context API para estado global
  - Componentes funcionales
  - Event handling
- **Documentación**: [react.dev](https://react.dev/)

#### React DOM v19.2.0
- **Propósito**: Renderizado de React en el DOM
- **Documentación**: [react.dev/reference/react-dom](https://react.dev/reference/react-dom)

### 3.2 Build Tool

#### Vite v7.2.4
- **Tipo**: Build tool de siguiente generación
- **Ventajas**:
  - Hot Module Replacement (HMR) ultra rápido
  - Build optimizado con Rollup
  - Soporte nativo para ES modules
  - Configuración mínima
- **Puerto por defecto**: 5173
- **Documentación**: [vitejs.dev](https://vitejs.dev/)

**Configuración**:
```javascript
{
  root: 'Front-End',
  server: {
    host: true,
    port: 5173,
    open: true,
    cors: true
  }
}
```

#### @vitejs/plugin-react v5.1.1
- **Propósito**: Plugin oficial de React para Vite
- **Características**:
  - Fast Refresh
  - JSX transformation
- **Documentación**: [github.com/vitejs/vite-plugin-react](https://github.com/vitejs/vite-plugin-react)

### 3.3 Enrutamiento

#### React Router DOM v7.10.1
- **Propósito**: Enrutamiento del lado del cliente (SPA)
- **Tipo de enrutamiento**: Browser Router
- **Características utilizadas**:
  - Rutas anidadas
  - Rutas protegidas (ProtectedRoute)
  - Navegación programática (useNavigate)
  - Parámetros de URL
- **Documentación**: [reactrouter.com](https://reactrouter.com/)

**Estructura de rutas**:
```
/                    - WelcomePage (pública)
/login               - Login (pública)
/register            - Register (condicional)
/forgot-password     - ForgotPassword (pública)
/reset-password/:token - ResetPassword (pública)
/home                - Home (protegida)
  /home/facturas     - Facturas (protegida)
  /home/clientes     - Clientes (protegida)
  /home/productos    - Productos (protegida)
  /home/reportes     - Reportes (protegida)
  /home/perfil       - Perfil (protegida)
  /home/users        - Users (admin)
```

### 3.4 Gestión de Estado

#### Context API (React nativo)
- **Contextos implementados**:

**AuthContext**:
```javascript
{
    user: { id, name, email, role },
    isAuthenticated: boolean,
    login: (userData) => void,
    logout: () => void
}
```

**ThemeContext**:
```javascript
{
    theme: 'light' | 'dark',
    toggleTheme: () => void
}
```

- **Persistencia**: localStorage para tema y token JWT

### 3.5 Iconos

#### React Icons v5.5.0
- **Propósito**: Conjunto de iconos populares como componentes React
- **Librerías incluidas**: Font Awesome, Material Design, etc.
- **Documentación**: [react-icons.github.io/react-icons](https://react-icons.github.io/react-icons/)

#### Lucide React v0.562.0
- **Propósito**: Iconos modernos y ligeros
- **Estilo**: Outline icons
- **Documentación**: [lucide.dev](https://lucide.dev/)

### 3.6 Estilos

#### CSS Modules
- **Tipo**: CSS puro con variables CSS (CSS Custom Properties)
- **Organización**:
  ```
  /styles
    ├── global.css                          # Variables globales y tema
    ├── home.css                             # Estilos del home
    ├── Modules_clients_products_factures.css # Módulos de gestión
    ├── forms_invoices.css                   # Formularios de facturas
    ├── froms_Products_Clients.css           # Formularios de productos/clientes
    ├── Registro_Login.css                   # Autenticación
    ├── Perfil.css                           # Perfil de usuario
    ├── users.css                            # Gestión de usuarios
    ├── Reportes.css                         # Módulo de reportes
    └── WelcomePage.css                      # Página de bienvenida
  ```

**Variables de tema**:
```css
:root {
  --u-background: #ffffff;
  --u-text: #1a1a1a;
  --u-card-bg: #f8f9fa;
  --color-primary: #4CAF50;
  --color-danger: #f44336;
}

[data-theme="dark"] {
  --u-background: #1a1a1a;
  --u-text: #e0e0e0;
  --u-card-bg: #2d2d2d;
}
```

---

## 🗄️ 4. Base de Datos

### 4.1 Sistema de Gestión

#### MySQL v8.0+
- **Tipo**: RDBMS (Relational Database Management System)
- **Motor de almacenamiento**: InnoDB
- **Características utilizadas**:
  - Transacciones ACID
  - Claves foráneas (Foreign Keys)
  - Triggers
  - Índices
  - JSON columns
  - Stored procedures (opcional)
- **Charset**: utf8mb4 (soporte completo Unicode)
- **Collation**: utf8mb4_unicode_ci
- **Documentación**: [dev.mysql.com/doc](https://dev.mysql.com/doc/)

### 4.2 Diseño de Base de Datos

**Modelo Relacional** con las siguientes entidades:

1. **users** - Usuarios del sistema
2. **clientes** - Clientes de facturación
3. **productos** - Catálogo de productos
4. **facturas** - Encabezado de facturas
5. **factura_detalles** - Líneas de detalle de facturas
6. **reportes** - Almacenamiento de reportes generados

**Relaciones**:
- users: 1 usuario → N facturas (creador)
- clientes: 1 cliente → N facturas
- productos: 1 producto → N factura_detalles
- facturas: 1 factura → N factura_detalles (CASCADE DELETE)

### 4.3 Migraciones

**Sistema de Migraciones**: Archivos SQL manuales

**Ubicación**: `/Backend/migrations/`

**Nombrado**: Descriptivo con prefijo temporal implícito

**Proceso**:
1. Crear archivo SQL con ALTER TABLE o CREATE TABLE
2. Documentar en README_MIGRACION.md
3. Ejecutar manualmente: `mysql -u user -p database < migration.sql`

---

## 📐 5. Estándares de Desarrollo

### 5.1 Estándar de Código JavaScript

#### ES6+ (ECMAScript 2015+)
- **Características utilizadas**:
  - Arrow functions
  - Template literals
  - Destructuring
  - Spread operator
  - Promises y async/await
  - ES Modules (import/export)
  - Optional chaining (?.)
  - Nullish coalescing (??)

#### ESLint v9.39.1
- **Propósito**: Linting y análisis estático de código
- **Configuración**: `eslint.config.js`
- **Plugins**:
  - @eslint/js
  - eslint-plugin-react-hooks
  - eslint-plugin-react-refresh
- **Documentación**: [eslint.org](https://eslint.org/)

### 5.2 Estándares de API REST

#### Convenciones RESTful

**Métodos HTTP**:
- `GET` - Obtener recursos (read)
- `POST` - Crear recursos (create)
- `PUT` - Actualizar recursos completos (update)
- `DELETE` - Eliminar recursos (delete)

**Códigos de Estado HTTP**:
- `200 OK` - Éxito general
- `201 Created` - Recurso creado exitosamente
- `204 No Content` - Eliminación exitosa
- `400 Bad Request` - Error de validación del cliente
- `401 Unauthorized` - No autenticado
- `403 Forbidden` - No autorizado (sin permisos)
- `404 Not Found` - Recurso no encontrado
- `409 Conflict` - Conflicto (ej: duplicado)
- `500 Internal Server Error` - Error del servidor

**Formato de Respuestas**:
```json
// Éxito
{
  "message": "Operación exitosa",
  "data": { ... }
}

// Error
{
  "message": "Descripción del error",
  "error": "Detalles técnicos"
}
```

### 5.3 Nomenclatura

#### Backend (JavaScript)
- **Archivos**: kebab-case (`user.controller.js`, `auth.middleware.js`)
- **Funciones**: camelCase (`getUserById`, `validateInput`)
- **Clases**: PascalCase (`UserModel`, `InvoiceController`)
- **Constantes**: UPPER_SNAKE_CASE (`JWT_SECRET`, `MAX_ATTEMPTS`)
- **Variables**: camelCase (`userData`, `isAuthenticated`)

#### Frontend (React)
- **Componentes**: PascalCase (`InvoiceForm.jsx`, `ProtectedRoute.jsx`)
- **Hooks personalizados**: camelCase con prefijo use (`useInvoiceLogic`)
- **Archivos CSS**: kebab-case (`global.css`, `forms-invoices.css`)
- **Constantes**: UPPER_SNAKE_CASE (`API_URL`, `ITEMS_PER_PAGE`)

#### Base de Datos
- **Tablas**: snake_case plural (`users`, `factura_detalles`)
- **Columnas**: snake_case (`nombre_razon_social`, `fecha_creacion`)
- **Índices**: `idx_table_column` (`idx_facturas_cliente_id`)
- **Claves foráneas**: `fk_table1_table2` (`fk_facturas_clientes`)

### 5.4 Comentarios y Documentación

#### JSDoc (Funciones importantes)
```javascript
/**
 * Crea una nueva factura en el sistema
 * @param {Object} req - Request object de Express
 * @param {Object} res - Response object de Express
 * @returns {Promise<void>}
 */
export const createInvoice = async (req, res) => { ... }
```

#### Comentarios de Bloque (Secciones)
```javascript
// ==========================================
// 1. CONFIGURACIÓN Y VARIABLES GLOBALES
// ==========================================
```

#### Comentarios Inline (Lógica compleja)
```javascript
// Calcular estado de vencimiento basado en fecha
const status = fecha_vencimiento < today ? 'Vencida' : 'Vigente';
```

### 5.5 Estructura de Archivos

#### Backend
```
Backend/
├── config/              # Configuraciones (DB, email)
├── controllers/         # Lógica de negocio
├── middleware/          # Middleware de Express
├── models/              # Modelos de datos
├── routes/              # Definición de rutas
├── migrations/          # Migraciones SQL
└── server.js            # Punto de entrada
```

#### Frontend
```
Front-End/src/
├── Auth/                # Componentes de autenticación
├── components/          # Componentes reutilizables
├── context/             # Context API (estado global)
├── forms/               # Formularios complejos
├── home/                # Componente principal Home
├── modules/             # Módulos de gestión (CRUD)
├── Pictures/            # Recursos estáticos
├── styles/              # Hojas de estilo CSS
├── utils/               # Utilidades y helpers
├── App.jsx              # Componente raíz
└── main.jsx             # Punto de entrada
```

---

## 🧪 6. Herramientas de Testing

### 6.1 Framework de Testing E2E

#### Playwright v1.57.0
- **Tipo**: Framework de testing end-to-end
- **Navegadores soportados**: Chromium, Firefox, WebKit
- **Características utilizadas**:
  - Tests automatizados de UI
  - Screenshots en fallos
  - Video recording
  - Parallel execution
  - Reportes HTML
- **Documentación**: [playwright.dev](https://playwright.dev/)

**Configuración**:
```javascript
{
  testDir: './tests',
  timeout: 60000,
  workers: 1,
  reporter: ['list', 'html', 'json', 'junit']
}
```

**Tests implementados**:
- `login.spec.js` - Pruebas de autenticación
- `navegacion_facturas.spec.js` - Navegación entre módulos
- `Acceder Hasta Formulario Crear Factura.spec.js` - Flujo completo de creación

### 6.2 Reportes de Testing

**Formatos generados**:
- HTML: `playwright-report/index.html` (visual)
- JSON: `playwright-results/results.json` (procesamiento)
- XML: `playwright-results/results.xml` (CI/CD)

---

## 🎯 7. Patrones de Diseño

### 7.1 Patrones Arquitecturales

#### MVC Modificado (Model-View-Controller)
```
Model       → /Backend/models/
View        → /Front-End/src/ (React components)
Controller  → /Backend/controllers/
```

#### Repository Pattern
- **Propósito**: Abstracción de acceso a datos
- **Implementación**: Modelos en `/Backend/models/`

### 7.2 Patrones de Backend

#### Middleware Pattern
```javascript
// Autenticación
authMiddleware → verifyToken → attachUser → next()

// Roles
adminMiddleware → checkRole → next() | 403
```

#### Factory Pattern
- **Uso**: Creación de conexiones de BD
- **Implementación**: Connection pool en `db.config.js`

### 7.3 Patrones de Frontend

#### Container/Presentational Pattern
- **Container**: Lógica de negocio y estado
- **Presentational**: UI pura sin lógica

#### Custom Hooks Pattern
```javascript
// Ejemplo: useInvoiceLogic()
const {
  numeroFactura,
  productosFactura,
  handleSubmit,
  ...
} = useInvoiceLogic();
```

#### Higher-Order Component (HOC)
```javascript
// ProtectedRoute.jsx
<ProtectedRoute>
  <Component />
</ProtectedRoute>
```

### 7.4 Patrones de Comunicación

#### Request-Response Pattern
- Cliente → HTTP Request → Servidor
- Servidor → JSON Response → Cliente

#### Observer Pattern
- **Implementación**: React Context API
- **Uso**: AuthContext notifica cambios de autenticación

---

## 📊 Resumen de Stack Tecnológico

| Capa | Tecnología | Versión | Propósito |
|------|-----------|---------|-----------|
| **Runtime** | Node.js | 18.x | Entorno de ejecución |
| **Framework Backend** | Express | 5.2.1 | API REST |
| **Base de Datos** | MySQL | 8.0+ | Almacenamiento relacional |
| **Driver BD** | MySQL2 | 3.15.3 | Cliente MySQL |
| **Autenticación** | JWT + bcryptjs | 9.0.3 / 3.0.3 | Seguridad |
| **Frontend Library** | React | 19.2.0 | UI |
| **Build Tool** | Vite | 7.2.4 | Bundler |
| **Routing** | React Router | 7.10.1 | SPA routing |
| **Email** | Nodemailer | 7.0.12 | Envío de emails |
| **PDF Generation** | Puppeteer | 24.35.0 | Generación de PDFs |
| **File Upload** | Multer | 2.0.2 | Subida de archivos |
| **Testing** | Playwright | 1.57.0 | E2E testing |
| **Linting** | ESLint | 9.39.1 | Análisis de código |

---

## 🔒 Estándares de Seguridad

### Implementados

1. **OWASP Top 10 Considerations**:
   - ✅ A01:2021 – Broken Access Control → RBAC implementado
   - ✅ A02:2021 – Cryptographic Failures → bcrypt para passwords
   - ✅ A03:2021 – Injection → Prepared statements
   - ✅ A05:2021 – Security Misconfiguration → .env para secrets
   - ✅ A07:2021 – Identification and Authentication Failures → JWT

2. **HTTPS**: Recomendado en producción (no implementado en desarrollo)

3. **CORS**: Configurado para desarrollo (requiere ajuste en producción)

4. **Validación**: Cliente y servidor (doble validación)

---

**Documento creado**: Enero 2026  
**Versión**: 1.0  
**Sistema**: Facturación Electrónica PFEPS
