# Diagrama de Componentes
## Sistema de Facturación Electrónica - PFEPS

---

## 📋 Tabla de Contenidos

1. [Arquitectura General del Sistema](#arquitectura-general-del-sistema)
2. [Componentes del Backend](#componentes-del-backend)
3. [Componentes del Frontend](#componentes-del-frontend)
4. [Interacciones entre Componentes](#interacciones-entre-componentes)
5. [Flujo de Datos](#flujo-de-datos)

---

## 🏗️ 1. Arquitectura General del Sistema

### Vista de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CAPA DE PRESENTACIÓN                        │
│                        (Frontend - React SPA)                       │
│                                                                     │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────┐               │
│  │   Auth     │  │   Modules   │  │  Components  │               │
│  │ Components │  │   (CRUD)    │  │   (Shared)   │               │
│  └────────────┘  └─────────────┘  └──────────────┘               │
│                                                                     │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────┐               │
│  │  Context   │  │    Forms    │  │    Utils     │               │
│  │    API     │  │  (Complex)  │  │   (Helpers)  │               │
│  └────────────┘  └─────────────┘  └──────────────┘               │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ HTTP/REST (JSON)
                           │ JWT Token
┌──────────────────────────▼──────────────────────────────────────────┐
│                         CAPA DE NEGOCIO                             │
│                     (Backend - Node.js/Express)                     │
│                                                                     │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────┐               │
│  │   Routes   │  │ Controllers │  │  Middleware  │               │
│  │  (Routing) │  │  (Business) │  │    (Auth)    │               │
│  └────────────┘  └─────────────┘  └──────────────┘               │
│                                                                     │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────┐               │
│  │   Models   │  │   Config    │  │   External   │               │
│  │   (Data)   │  │   (Setup)   │  │   Services   │               │
│  └────────────┘  └─────────────┘  └──────────────┘               │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ SQL Queries
                           │ Connection Pool
┌──────────────────────────▼──────────────────────────────────────────┐
│                         CAPA DE DATOS                               │
│                      (MySQL Database 8.0+)                          │
│                                                                     │
│  ┌────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ users  │ │ clientes │ │productos │ │ facturas │ │ reportes │  │
│  └────────┘ └──────────┘ └──────────┘ └────┬─────┘ └──────────┘  │
│                                             │                       │
│                                    ┌────────▼─────────┐            │
│                                    │ factura_detalles │            │
│                                    └──────────────────┘            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 2. Componentes del Backend

### 2.1 Arquitectura de Backend

```
Backend/
│
├── [server.js] ◄────────────────────── Punto de Entrada Principal
│       │
│       ├─► Express App Initialization
│       ├─► Middleware Configuration (CORS, JSON Parser)
│       ├─► Static Files Server (/pictures)
│       └─► Routes Registration
│
├── routes/ ◄────────────────────────── Capa de Enrutamiento
│   │
│   ├── [auth.routes.js]
│   │     └─► POST /api/auth/register
│   │     └─► POST /api/auth/login
│   │     └─► POST /api/auth/forgot-password
│   │     └─► POST /api/auth/reset-password
│   │     └─► GET  /api/auth/has-users
│   │
│   ├── [user.routes.js]
│   │     └─► GET    /api/users
│   │     └─► POST   /api/users
│   │     └─► PUT    /api/users/:id
│   │     └─► DELETE /api/users/:id
│   │
│   ├── [cliente.routes.js]
│   │     └─► GET    /api/clientes
│   │     └─► GET    /api/clientes/:id
│   │     └─► GET    /api/clientes/identificacion/:identificacion
│   │     └─► POST   /api/clientes
│   │     └─► PUT    /api/clientes/:id
│   │     └─► DELETE /api/clientes/:id
│   │
│   ├── [producto.routes.js]
│   │     └─► GET    /api/productos
│   │     └─► GET    /api/productos/:id
│   │     └─► POST   /api/productos
│   │     └─► PUT    /api/productos/:id
│   │     └─► DELETE /api/productos/:id
│   │
│   ├── [invoiceRoutes.js]
│   │     └─► GET    /api/facturas
│   │     └─► GET    /api/facturas/:id
│   │     └─► GET    /api/facturas/proximo-numero
│   │     └─► POST   /api/facturas
│   │     └─► PUT    /api/facturas/:id
│   │     └─► PUT    /api/facturas/:id/estado
│   │     └─► POST   /api/facturas/:id/emitir
│   │     └─► DELETE /api/facturas/:id
│   │
│   ├── [perfil.routes.js]
│   │     └─► GET    /api/perfil
│   │     └─► PUT    /api/perfil
│   │     └─► POST   /api/perfil/cambiar-password
│   │     └─► POST   /api/perfil/foto
│   │
│   └── [reportes.routes.js]
│         └─► GET    /api/reportes
│         └─► POST   /api/reportes/generar
│         └─► GET    /api/reportes/:id
│
├── middleware/ ◄─────────────────────── Capa de Middleware
│   │
│   └── [auth.middleware.js]
│         ├─► authMiddleware(req, res, next)
│         │     ├─► Verifica header Authorization
│         │     ├─► Extrae y valida token JWT
│         │     ├─► Decodifica token
│         │     └─► Adjunta user data a req.user
│         │
│         └─► adminMiddleware(req, res, next)
│               └─► Verifica que req.user.role === 'admin'
│
├── controllers/ ◄────────────────────── Capa de Lógica de Negocio
│   │
│   ├── [auth.controller.js]
│   │     ├─► register()
│   │     ├─► login()
│   │     ├─► forgotPassword()
│   │     ├─► resetPassword()
│   │     └─► hasUsers()
│   │
│   ├── [user.controller.js]
│   │     ├─► getAllUsers()
│   │     ├─► createUser()
│   │     ├─► updateUser()
│   │     └─► deleteUser()
│   │
│   ├── [cliente.controller.js]
│   │     ├─► getAllClientes()
│   │     ├─► getClienteById()
│   │     ├─► getClienteByIdentificacion()
│   │     ├─► createCliente()
│   │     ├─► updateCliente()
│   │     └─► deleteCliente()
│   │
│   ├── [productoController.js]
│   │     ├─► getAllProductos()
│   │     ├─► getProductoById()
│   │     ├─► createProducto()
│   │     ├─► updateProducto()
│   │     └─► deleteProducto()
│   │
│   ├── [invoice.controller.js]
│   │     ├─► getAllInvoices()
│   │     ├─► getInvoiceById()
│   │     ├─► getNextInvoiceNumber()
│   │     ├─► createInvoice()
│   │     ├─► updateInvoice()
│   │     ├─► updateInvoiceStatus()
│   │     ├─► emitInvoice()
│   │     └─► deleteInvoice()
│   │
│   ├── [perfilController.js]
│   │     ├─► getPerfil()
│   │     ├─► updatePerfil()
│   │     ├─► cambiarPassword()
│   │     └─► uploadPhoto()
│   │
│   └── [reportes.controller.js]
│         ├─► getReportes()
│         ├─► generarReporte()
│         └─► getReporteById()
│
├── models/ ◄─────────────────────────── Capa de Acceso a Datos
│   │
│   ├── [db.js]
│   │     └─► MySQL Connection Pool
│   │           ├─► testConnection()
│   │           └─► export pool.promise()
│   │
│   └── [User.model.js]
│         ├─► findUserByEmail(email)
│         ├─► findUserByIdentification(identification)
│         ├─► createUser(userData)
│         ├─► hasUsers()
│         ├─► createPasswordResetToken(userId)
│         ├─► verifyPasswordResetToken(token)
│         └─► updatePassword(userId, newPassword)
│
└── config/ ◄─────────────────────────── Configuración y Servicios
    │
    ├── [db.config.js]
    │     └─► MySQL Pool Configuration
    │           ├─► Host, User, Password, Database
    │           ├─► Connection Limit: 10
    │           └─► Export db connection
    │
    └── [email.config.js]
          └─► Nodemailer Configuration
                ├─► SMTP Transport Setup
                ├─► sendInvoiceEmail(facturaData)
                └─► Email Templates (HTML)
```

### 2.2 Componentes Clave del Backend

#### Componente: Server (server.js)

```javascript
┌─────────────────────────────────────────────────┐
│           server.js (Main Entry Point)          │
├─────────────────────────────────────────────────┤
│                                                 │
│  Responsibilities:                              │
│  • Initialize Express application               │
│  • Configure middleware (CORS, JSON parser)     │
│  • Serve static files (/pictures)              │
│  • Register all route modules                   │
│  • Start HTTP server on PORT 8080              │
│  • Display network IP addresses                 │
│                                                 │
│  Dependencies:                                  │
│  ├─► express                                    │
│  ├─► cors                                       │
│  ├─► dotenv                                     │
│  └─► All route modules                          │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### Componente: Auth Middleware

```javascript
┌─────────────────────────────────────────────────┐
│          auth.middleware.js                     │
├─────────────────────────────────────────────────┤
│                                                 │
│  authMiddleware(req, res, next)                 │
│  ├─► Extract Authorization header               │
│  ├─► Verify Bearer token format                 │
│  ├─► jwt.verify(token, JWT_SECRET)             │
│  ├─► Decode token → user data                   │
│  ├─► Attach user to req.user                    │
│  └─► Call next() or return 401/403             │
│                                                 │
│  adminMiddleware(req, res, next)                │
│  ├─► Check req.user exists                      │
│  ├─► Verify req.user.role === 'admin'          │
│  └─► Call next() or return 403                  │
│                                                 │
│  Used By:                                       │
│  • All protected routes                         │
│  • User management endpoints (admin only)       │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### Componente: Invoice Controller

```javascript
┌─────────────────────────────────────────────────┐
│         invoice.controller.js                   │
├─────────────────────────────────────────────────┤
│                                                 │
│  getAllInvoices()                               │
│  ├─► Query facturas con JOIN a clientes        │
│  ├─► Aggregate detalles as JSON                 │
│  ├─► Calculate estado_vencimiento              │
│  └─► Return JSON array                          │
│                                                 │
│  createInvoice()                                │
│  ├─► Validate cliente_id y productos           │
│  ├─► Start DB transaction                       │
│  ├─► INSERT into facturas                       │
│  ├─► INSERT into factura_detalles (batch)      │
│  ├─► COMMIT transaction                         │
│  └─► Return created invoice                     │
│                                                 │
│  emitInvoice()                                  │
│  ├─► Fetch invoice with details                │
│  ├─► Generate PDF with Puppeteer               │
│  ├─► Send email with PDF attached              │
│  ├─► Update estado_emision = 'emitida'         │
│  └─► Return success/error                       │
│                                                 │
│  Dependencies:                                  │
│  ├─► db (MySQL pool)                            │
│  ├─► Puppeteer (PDF generation)                 │
│  └─► email.config (Nodemailer)                  │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🎨 3. Componentes del Frontend

### 3.1 Arquitectura de Frontend

```
Front-End/src/
│
├── [main.jsx] ◄──────────────────────── Punto de Entrada
│       │
│       └─► ReactDOM.render(<App />)
│
├── [App.jsx] ◄───────────────────────── Componente Raíz
│       │
│       ├─► AuthContext.Provider
│       ├─► ThemeContext.Provider
│       └─► React Router Configuration
│
├── context/ ◄────────────────────────── Estado Global
│   │
│   ├── [AuthContext.jsx]
│   │     └─► Context: { user, isAuthenticated, login(), logout() }
│   │
│   └── [ThemeContext.jsx]
│         └─► Context: { theme, toggleTheme() }
│
├── Auth/ ◄───────────────────────────── Componentes de Autenticación
│   │
│   ├── [WelcomePage.jsx]
│   │     └─► Landing page pública
│   │
│   ├── [Login.jsx]
│   │     ├─► Form: email, password
│   │     ├─► POST /api/auth/login
│   │     └─► Navigate to /home
│   │
│   ├── [Register.jsx]
│   │     ├─► Form: name, identification, email, password
│   │     ├─► POST /api/auth/register
│   │     └─► Navigate to /home
│   │
│   ├── [ForgotPassword.jsx]
│   │     ├─► Form: email
│   │     └─► POST /api/auth/forgot-password
│   │
│   └── [ResetPassword.jsx]
│         ├─► Form: new password, confirm
│         └─► POST /api/auth/reset-password/:token
│
├── components/ ◄─────────────────────── Componentes Compartidos
│   │
│   ├── [ProtectedRoute.jsx]
│   │     ├─► Verifica isAuthenticated
│   │     └─► Redirect to /login si no autenticado
│   │
│   ├── [ThemeSwitch.jsx]
│   │     └─► Toggle entre light/dark mode
│   │
│   ├── [InvoiceStatusModal.jsx]
│   │     ├─► Modal para cambiar estado de factura
│   │     └─► PUT /api/facturas/:id/estado
│   │
│   └── InvoicePDF/
│         └─► Componentes para generación de PDF
│
├── modules/ ◄────────────────────────── Módulos CRUD Principales
│   │
│   ├── [users.jsx]
│   │     ├─► Listar usuarios
│   │     ├─► Crear/Editar/Eliminar usuario
│   │     └─► GET/POST/PUT/DELETE /api/users
│   │
│   ├── [Clientes.jsx]
│   │     ├─► Listar clientes
│   │     ├─► Crear/Editar/Eliminar cliente
│   │     └─► GET/POST/PUT/DELETE /api/clientes
│   │
│   ├── [Productos.jsx]
│   │     ├─► Listar productos
│   │     ├─► Crear/Editar/Eliminar producto
│   │     └─► GET/POST/PUT/DELETE /api/productos
│   │
│   ├── [Facturas.jsx]
│   │     ├─► Listar facturas con paginación
│   │     ├─► Filtrar por estado
│   │     ├─► Ver PDF
│   │     ├─► Emitir factura
│   │     └─► GET/POST/PUT/DELETE /api/facturas
│   │
│   ├── [Perfil.jsx]
│   │     ├─► Ver/Editar datos personales
│   │     ├─► Cambiar contraseña
│   │     ├─► Cambiar foto de perfil
│   │     └─► GET/PUT /api/perfil
│   │
│   └── [Reportes.jsx]
│         ├─► Dashboard de métricas
│         ├─► Generar reportes
│         └─► GET /api/reportes
│
├── forms/ ◄──────────────────────────── Formularios Complejos
│   │
│   ├── [InvoiceForm.jsx]
│   │     ├─► Formulario para factura con cliente existente
│   │     ├─► Autocompletado de cliente
│   │     ├─► Autocompletado de productos
│   │     ├─► Cálculo automático de totales
│   │     └─► POST /api/facturas
│   │
│   ├── [Invoicenewclient.jsx]
│   │     ├─► Formulario para factura con cliente nuevo
│   │     ├─► Incluye formulario de cliente
│   │     └─► POST /api/clientes + POST /api/facturas
│   │
│   ├── [ClientForm.jsx]
│   │     └─► Formulario modal para clientes
│   │
│   ├── [ProductForm.jsx]
│   │     └─► Formulario modal para productos
│   │
│   └── [logica.js]
│         └─► Hook personalizado: useInvoiceLogic()
│
├── home/ ◄───────────────────────────── Componente Principal
│   │
│   └── [home.jsx]
│         ├─► Layout principal con navbar
│         ├─► Navegación entre módulos
│         └─► Rutas anidadas
│
├── utils/ ◄──────────────────────────── Utilidades
│   │
│   ├── [pdfGenerator.jsx]
│   │     └─► visualizarFactura(facturaData)
│   │
│   ├── [tableHelpers.js]
│   │     └─► Helpers para tablas (ordenamiento, filtrado)
│   │
│   └── [validations.js]
│         └─► Funciones de validación de formularios
│
└── styles/ ◄─────────────────────────── Estilos CSS
    │
    ├── [global.css]
    │     └─► Variables CSS, tema global
    │
    ├── [Modules_clients_products_factures.css]
    │     └─► Estilos para módulos CRUD
    │
    ├── [forms_invoices.css]
    │     └─► Estilos para formularios de facturas
    │
    └── [...]
```

### 3.2 Componentes Clave del Frontend

#### Componente: AuthContext

```javascript
┌─────────────────────────────────────────────────┐
│             AuthContext.jsx                     │
├─────────────────────────────────────────────────┤
│                                                 │
│  State:                                         │
│  ├─► user: { id, name, email, role }           │
│  └─► isAuthenticated: boolean                   │
│                                                 │
│  Methods:                                       │
│  ├─► login(userData)                            │
│  │     ├─► Store token in sessionStorage       │
│  │     ├─► Update user state                   │
│  │     └─► Set isAuthenticated = true          │
│  │                                              │
│  └─► logout()                                   │
│        ├─► Clear sessionStorage                 │
│        ├─► Clear user state                     │
│        └─► Set isAuthenticated = false         │
│                                                 │
│  Persistence:                                   │
│  • Token stored in sessionStorage               │
│  • Auto-restore on page reload                  │
│                                                 │
│  Used By:                                       │
│  • All protected routes                         │
│  • Header navigation                            │
│  • ProtectedRoute component                     │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### Componente: InvoiceForm (con logica.js)

```javascript
┌─────────────────────────────────────────────────┐
│         InvoiceForm.jsx + logica.js             │
├─────────────────────────────────────────────────┤
│                                                 │
│  State (useInvoiceLogic hook):                  │
│  ├─► numeroFactura: string (auto-generado)     │
│  ├─► fechaEmision: date                         │
│  ├─► fechaVencimiento: date                     │
│  ├─► cliente: object                            │
│  ├─► productosFactura: array                    │
│  └─► errores: object                            │
│                                                 │
│  Features:                                      │
│  ├─► Autocompletar cliente por identificación  │
│  │     └─► GET /api/clientes/identificacion/:id│
│  │                                              │
│  ├─► Autocompletar producto por código         │
│  │     └─► GET /api/productos?search=:codigo   │
│  │                                              │
│  ├─► Cálculo automático de totales             │
│  │     ├─► Subtotal por línea                  │
│  │     ├─► IVA por línea                       │
│  │     ├─► Descuento por línea                 │
│  │     └─► Total general                       │
│  │                                              │
│  ├─► Validación en tiempo real                 │
│  │     ├─► Cliente existe                      │
│  │     ├─► Producto existe                     │
│  │     ├─► Cantidades válidas                  │
│  │     └─► Descuentos en rango 0-100          │
│  │                                              │
│  └─► Submit                                     │
│        ├─► Validar todos los campos            │
│        ├─► POST /api/facturas                  │
│        └─► Redirect o mostrar mensaje          │
│                                                 │
│  UI Components:                                 │
│  ├─► Datalist para autocompletado              │
│  ├─► Grid de productos (7 columnas)            │
│  ├─► Botones agregar/eliminar líneas           │
│  └─► Resumen de totales                        │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### Componente: Facturas Module

```javascript
┌─────────────────────────────────────────────────┐
│              Facturas.jsx                       │
├─────────────────────────────────────────────────┤
│                                                 │
│  State:                                         │
│  ├─► invoices: array                            │
│  ├─► loading: boolean                           │
│  ├─► searchTerm: string                         │
│  ├─► filterStatus: string                       │
│  └─► currentPage: number                        │
│                                                 │
│  Methods:                                       │
│  ├─► fetchInvoices()                            │
│  │     └─► GET /api/facturas                   │
│  │                                              │
│  ├─► handleEmit(invoice)                        │
│  │     ├─► Confirm action                      │
│  │     ├─► POST /api/facturas/:id/emitir       │
│  │     └─► Update list                         │
│  │                                              │
│  ├─► handleViewPDF(invoice)                     │
│  │     └─► visualizarFactura(invoice)          │
│  │                                              │
│  ├─► handleStatusChange(invoice, newStatus)    │
│  │     ├─► Open InvoiceStatusModal             │
│  │     └─► PUT /api/facturas/:id/estado        │
│  │                                              │
│  └─► handleDelete(invoice) [Admin only]        │
│        ├─► Confirm action                      │
│        └─► DELETE /api/facturas/:id            │
│                                                 │
│  Features:                                      │
│  ├─► Paginación (30 items/página)              │
│  ├─► Búsqueda por número, cliente, ID          │
│  ├─► Filtro por estado                         │
│  ├─► Badges de estado con colores              │
│  └─► Acciones: Ver, Emitir, Eliminar          │
│                                                 │
│  UI:                                            │
│  └─► Tabla responsive con:                     │
│       ├─► # Factura                            │
│       ├─► Fecha                                │
│       ├─► Cliente                              │
│       ├─► Total                                │
│       ├─► Estado                               │
│       ├─► Estado Emisión                       │
│       └─► Acciones (botones)                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🔄 4. Interacciones entre Componentes

### 4.1 Flujo de Autenticación

```
┌─────────────┐          ┌─────────────┐          ┌─────────────┐
│   Login.jsx │          │   Backend   │          │  Database   │
└──────┬──────┘          └──────┬──────┘          └──────┬──────┘
       │                        │                        │
       │ 1. POST /api/auth/login│                        │
       ├───────────────────────►│                        │
       │   { email, password }  │                        │
       │                        │ 2. Query user          │
       │                        ├───────────────────────►│
       │                        │                        │
       │                        │ 3. Return user data    │
       │                        │◄───────────────────────┤
       │                        │                        │
       │                        │ 4. bcrypt.compare()    │
       │                        │    (password check)    │
       │                        │                        │
       │                        │ 5. jwt.sign()          │
       │                        │    (generate token)    │
       │                        │                        │
       │ 6. Return token + user │                        │
       │◄───────────────────────┤                        │
       │                        │                        │
       │ 7. Store in            │                        │
       │    sessionStorage      │                        │
       │                        │                        │
       │ 8. Update AuthContext  │                        │
       │                        │                        │
       │ 9. Navigate to /home   │                        │
       │                        │                        │
```

### 4.2 Flujo de Creación de Factura

```
┌──────────────┐    ┌─────────────┐    ┌─────────────┐    ┌──────────┐
│InvoiceForm.jsx│    │   Backend   │    │  Database   │    │ Cliente  │
└──────┬───────┘    └──────┬──────┘    └──────┬──────┘    └────┬─────┘
       │                   │                   │                 │
       │ 1. User ingresa   │                   │                 │
       │    identificación │                   │                 │
       │                   │                   │                 │
       │ 2. GET /api/clientes/identificacion/:id                 │
       ├──────────────────►│                   │                 │
       │                   │ 3. Query cliente  │                 │
       │                   ├──────────────────►│                 │
       │                   │ 4. Return cliente │                 │
       │ 5. Autocompletar  │◄──────────────────┤                 │
       │◄──────────────────┤                   │                 │
       │    datos cliente  │                   │                 │
       │                   │                   │                 │
       │ 6. User agrega    │                   │                 │
       │    productos      │                   │                 │
       │                   │                   │                 │
       │ 7. Calculate      │                   │                 │
       │    totals         │                   │                 │
       │                   │                   │                 │
       │ 8. POST /api/facturas                 │                 │
       ├──────────────────►│                   │                 │
       │  { cliente_id,    │                   │                 │
       │    productos[],   │                   │                 │
       │    totales }      │                   │                 │
       │                   │ 9. BEGIN TRANSACTION                │
       │                   ├──────────────────►│                 │
       │                   │                   │                 │
       │                   │ 10. INSERT facturas                 │
       │                   ├──────────────────►│                 │
       │                   │                   │                 │
       │                   │ 11. INSERT factura_detalles         │
       │                   ├──────────────────►│                 │
       │                   │                   │                 │
       │                   │ 12. COMMIT        │                 │
       │                   ├──────────────────►│                 │
       │                   │                   │                 │
       │ 13. Return success│                   │                 │
       │◄──────────────────┤                   │                 │
       │                   │                   │                 │
       │ 14. Navigate to   │                   │                 │
       │     /facturas     │                   │                 │
       │                   │                   │                 │
```

### 4.3 Flujo de Emisión de Factura

```
┌─────────────┐  ┌────────────┐  ┌──────────┐  ┌─────────┐  ┌────────┐
│Facturas.jsx │  │  Backend   │  │ Database │  │Puppeteer│  │  SMTP  │
└──────┬──────┘  └─────┬──────┘  └────┬─────┘  └────┬────┘  └───┬────┘
       │                │              │             │            │
       │ 1. Click Emitir│              │             │            │
       ├───────────────►│              │             │            │
       │                │              │             │            │
       │ 2. POST /api/facturas/:id/emitir           │            │
       ├───────────────►│              │             │            │
       │                │ 3. Query     │             │            │
       │                │    factura   │             │            │
       │                │    completa  │             │            │
       │                ├─────────────►│             │            │
       │                │ 4. Return    │             │            │
       │                │    data      │             │            │
       │                │◄─────────────┤             │            │
       │                │              │             │            │
       │                │ 5. Generate HTML template  │            │
       │                │              │             │            │
       │                │ 6. Launch browser          │            │
       │                ├────────────────────────────►│            │
       │                │              │             │            │
       │                │ 7. Render HTML to PDF      │            │
       │                │              │             │            │
       │                │ 8. Return PDF buffer       │            │
       │                │◄────────────────────────────┤            │
       │                │              │             │            │
       │                │ 9. Send email with PDF     │            │
       │                ├────────────────────────────────────────►│
       │                │              │             │            │
       │                │ 10. Email sent confirmation │           │
       │                │◄────────────────────────────────────────┤
       │                │              │             │            │
       │                │ 11. UPDATE   │             │            │
       │                │     estado_emision         │            │
       │                ├─────────────►│             │            │
       │                │              │             │            │
       │ 12. Return     │              │             │            │
       │     success    │              │             │            │
       │◄───────────────┤              │             │            │
       │                │              │             │            │
       │ 13. Show alert │              │             │            │
       │     & refresh  │              │             │            │
       │                │              │             │            │
```

---

## 📊 5. Flujo de Datos

### 5.1 Diagrama de Flujo de Datos (DFD) - Nivel 0

```
                    ┌───────────────────┐
                    │                   │
                    │   ADMINISTRADOR   │
                    │                   │
                    └─────────┬─────────┘
                              │
                              │ Gestiona sistema
                              │
              ┌───────────────▼───────────────┐
              │                               │
         ┌────┤   SISTEMA DE FACTURACIÓN     ├────┐
         │    │        ELECTRÓNICA            │    │
         │    └───────────────────────────────┘    │
         │                                         │
    Datos│                                         │Facturas
         │                                         │
         ▼                                         ▼
┌─────────────────┐                       ┌─────────────┐
│                 │                       │             │
│   EMPLEADO      │                       │  CLIENTES   │
│                 │                       │             │
└─────────────────┘                       └─────────────┘
```

### 5.2 Flujo de Datos por Módulo

#### Gestión de Clientes

```
Usuario → [Form: datos cliente] → POST /api/clientes 
                                        │
                                        ▼
                                   Validación
                                        │
                                        ▼
                                   INSERT clientes
                                        │
                                        ▼
                                 Return cliente creado
                                        │
                                        ▼
                                  Actualizar UI
```

#### Gestión de Facturas

```
Usuario → [InvoiceForm]
             │
             ├─► Autocompletar cliente (GET /api/clientes/:id)
             ├─► Autocompletar productos (GET /api/productos?search=)
             ├─► Calcular totales (client-side)
             └─► Submit factura (POST /api/facturas)
                      │
                      ▼
                 Backend validation
                      │
                      ▼
                 DB Transaction
                      │
                      ├─► INSERT facturas
                      └─► INSERT factura_detalles
                      │
                      ▼
                   Commit
                      │
                      ▼
                Return success
                      │
                      ▼
              Update factura list
```

---

## 🔌 6. Interfaces de Comunicación

### 6.1 API REST Endpoints

| Método | Endpoint | Request | Response | Descripción |
|--------|----------|---------|----------|-------------|
| POST | /api/auth/login | `{ email, password }` | `{ token, user }` | Autenticar usuario |
| GET | /api/facturas | Headers: `Authorization: Bearer {token}` | `[{ factura }, ...]` | Listar facturas |
| POST | /api/facturas | `{ cliente_id, productos[], totales }` | `{ id, numero_factura }` | Crear factura |
| POST | /api/facturas/:id/emitir | - | `{ message, numeroFactura, email }` | Emitir factura |

### 6.2 Formato de Datos

#### Factura Completa

```json
{
  "id": 1,
  "numero_factura": "FACT-0001",
  "cliente": {
    "id": 5,
    "identificacion": "900123456-7",
    "nombre_razon_social": "Empresa ABC S.A.S.",
    "email": "contacto@empresaabc.com",
    "telefono": "3001234567",
    "direccion": "Calle 123 #45-67"
  },
  "fecha_creacion": "2026-01-25T10:30:00",
  "fecha_emision": "2026-01-25T15:45:00",
  "fecha_vencimiento": "2026-02-24",
  "detalles": [
    {
      "producto_id": 1,
      "codigo": "PROD001",
      "nombre": "Laptop Dell Inspiron 15",
      "cantidad": 1,
      "precio_unitario": 2500000.00,
      "descuento": 0.00,
      "subtotal": 2500000.00,
      "iva": 475000.00,
      "total": 2975000.00
    }
  ],
  "subtotal": 2500000.00,
  "iva": 475000.00,
  "descuento_porcentaje": 0.00,
  "total": 2975000.00,
  "estado": "Pagada",
  "estado_emision": "emitida",
  "estado_vencimiento": "Finalizada"
}
```

---

## 📦 7. Dependencias entre Componentes

### Backend Dependencies

```
server.js
    ├─► express
    ├─► cors
    ├─► dotenv
    ├─► routes/*
    └─► models/db.js

routes/invoice.routes.js
    ├─► express.Router
    ├─► controllers/invoice.controller.js
    └─► middleware/auth.middleware.js

controllers/invoice.controller.js
    ├─► models/db.js
    ├─► config/email.config.js
    └─► puppeteer

config/email.config.js
    └─► nodemailer
```

### Frontend Dependencies

```
main.jsx
    ├─► react
    ├─► react-dom
    └─► App.jsx

App.jsx
    ├─► react-router-dom
    ├─► context/AuthContext.jsx
    ├─► context/ThemeContext.jsx
    └─► All route components

modules/Facturas.jsx
    ├─► react-router-dom (useNavigate)
    ├─► context/AuthContext (useAuth)
    ├─► components/InvoiceStatusModal
    ├─► utils/pdfGenerator
    └─► axios (HTTP client)

forms/InvoiceForm.jsx
    ├─► forms/logica.js (useInvoiceLogic)
    ├─► utils/validations.js
    └─► axios
```

---

**Documento creado**: Enero 2026  
**Versión**: 1.0  
**Sistema**: Facturación Electrónica PFEPS
