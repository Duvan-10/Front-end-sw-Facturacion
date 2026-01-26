# Requisitos Funcionales y No Funcionales
## Sistema de Facturación Electrónica - PFEPS

---

## 📋 1. REQUISITOS FUNCIONALES

### 1.1 Autenticación y Gestión de Usuarios

#### RF-001: Registro de Usuario Inicial
- **Descripción**: El sistema debe permitir el registro del primer usuario como administrador.
- **Prioridad**: Alta
- **Entradas**: Nombre, identificación, email, contraseña
- **Salidas**: Usuario creado con rol de administrador
- **Precondiciones**: No deben existir usuarios registrados en el sistema

#### RF-002: Inicio de Sesión
- **Descripción**: El sistema debe autenticar usuarios mediante email y contraseña usando JWT.
- **Prioridad**: Alta
- **Entradas**: Email, contraseña
- **Salidas**: Token JWT, información del usuario
- **Precondiciones**: Usuario debe estar registrado en el sistema

#### RF-003: Gestión de Roles
- **Descripción**: El sistema debe manejar tres tipos de roles: Admin, Usuario y Empleado.
- **Prioridad**: Alta
- **Roles**:
  - **Admin**: Acceso total + gestión de usuarios
  - **Empleado**: CRUD sobre clientes, productos y facturas
  - **Usuario**: Solo lectura de datos

#### RF-004: Recuperación de Contraseña
- **Descripción**: El sistema debe permitir la recuperación de contraseña mediante email.
- **Prioridad**: Media
- **Entradas**: Email del usuario
- **Salidas**: Token de recuperación enviado por email
- **Duración del token**: 1 hora

#### RF-005: Gestión de Usuarios (Admin)
- **Descripción**: Solo el administrador puede crear nuevos usuarios.
- **Prioridad**: Alta
- **Operaciones**: Crear, listar, editar y eliminar usuarios

### 1.2 Gestión de Clientes

#### RF-006: Registro de Clientes
- **Descripción**: El sistema debe permitir registrar clientes con su información completa.
- **Prioridad**: Alta
- **Datos requeridos**:
  - Tipo de identificación (Cédula/NIT/Pasaporte)
  - Número de identificación (único)
  - Nombre o razón social
  - Email
  - Teléfono
  - Dirección
  - Fecha de creación (automática)

#### RF-007: Búsqueda de Clientes
- **Descripción**: El sistema debe permitir buscar clientes por identificación o nombre.
- **Prioridad**: Alta
- **Entradas**: Texto de búsqueda
- **Salidas**: Lista de clientes coincidentes

#### RF-008: Autocompletado de Clientes
- **Descripción**: El sistema debe autocompletar datos del cliente al ingresar su identificación en facturas.
- **Prioridad**: Media
- **Funcionalidad**: Al presionar TAB en el campo de identificación

#### RF-009: Actualización de Clientes
- **Descripción**: El sistema debe permitir editar información de clientes existentes.
- **Prioridad**: Alta
- **Validaciones**: No permitir identificaciones duplicadas

#### RF-010: Eliminación de Clientes
- **Descripción**: El sistema debe permitir eliminar clientes.
- **Prioridad**: Media
- **Restricción**: Validar que no tenga facturas asociadas

### 1.3 Gestión de Productos

#### RF-011: Registro de Productos
- **Descripción**: El sistema debe permitir registrar productos con su información.
- **Prioridad**: Alta
- **Datos requeridos**:
  - Código del producto (único)
  - Nombre del producto
  - Precio unitario (no negativo)
  - Porcentaje de impuesto (IVA)
  - Descripción

#### RF-012: Búsqueda de Productos
- **Descripción**: El sistema debe permitir buscar productos por código o nombre.
- **Prioridad**: Alta
- **Entradas**: Código o nombre del producto
- **Salidas**: Lista de productos coincidentes

#### RF-013: Autocompletado de Productos
- **Descripción**: El sistema debe autocompletar datos del producto en facturas al ingresar código.
- **Prioridad**: Media
- **Funcionalidad**: Al presionar TAB en el campo de código

#### RF-014: Actualización de Productos
- **Descripción**: El sistema debe permitir editar información de productos.
- **Prioridad**: Alta
- **Validaciones**: Precios no negativos, código único

#### RF-015: Eliminación de Productos
- **Descripción**: El sistema debe permitir eliminar productos.
- **Prioridad**: Media
- **Restricción**: Validar que no esté en facturas pendientes

### 1.4 Gestión de Facturas

#### RF-016: Creación de Facturas con Cliente Existente
- **Descripción**: El sistema debe permitir crear facturas seleccionando un cliente existente.
- **Prioridad**: Alta
- **Datos requeridos**:
  - Número de factura (automático)
  - Cliente (identificación)
  - Fecha de emisión (automática)
  - Fecha de vencimiento
  - Productos con cantidad, precio y descuento
  - Subtotal, IVA y total (calculados)

#### RF-017: Creación de Facturas con Cliente Nuevo
- **Descripción**: El sistema debe permitir crear facturas registrando un nuevo cliente simultáneamente.
- **Prioridad**: Alta
- **Flujo**: Registro de cliente + creación de factura en una sola operación

#### RF-018: Numeración Automática de Facturas
- **Descripción**: El sistema debe generar números de factura consecutivos automáticamente.
- **Prioridad**: Alta
- **Formato**: Numérico secuencial

#### RF-019: Cálculo Automático de Totales
- **Descripción**: El sistema debe calcular automáticamente subtotales, descuentos, IVA y total.
- **Prioridad**: Alta
- **Fórmulas**:
  - Subtotal = (Precio × Cantidad) - Descuento
  - IVA = Subtotal × (% Impuesto / 100)
  - Total = Subtotal + IVA

#### RF-020: Gestión de Estados de Factura
- **Descripción**: El sistema debe manejar diferentes estados de pago para las facturas.
- **Prioridad**: Alta
- **Estados posibles**:
  - Pendiente
  - Pagada
  - Parcial
  - Vencida
  - Anulada

#### RF-021: Gestión de Estado de Vencimiento
- **Descripción**: El sistema debe calcular automáticamente el estado de vencimiento.
- **Prioridad**: Media
- **Estados**:
  - Vigente: Antes de fecha de vencimiento
  - Vencida: Después de fecha de vencimiento y no pagada
  - Finalizada: Cuando está pagada

#### RF-022: Emisión de Facturas
- **Descripción**: El sistema debe emitir facturas generando PDF y enviando por email.
- **Prioridad**: Alta
- **Estados de emisión**:
  - Pendiente: No emitida
  - Emitida: PDF generado y enviado
  - Error: Falló el envío

#### RF-023: Generación de PDF
- **Descripción**: El sistema debe generar PDFs profesionales de las facturas.
- **Prioridad**: Alta
- **Contenido**:
  - Logo de la empresa
  - Datos del emisor
  - Datos del cliente
  - Detalle de productos con descuentos
  - Subtotales, IVA y total
  - Fecha de emisión y vencimiento

#### RF-024: Envío de Facturas por Email
- **Descripción**: El sistema debe enviar facturas por email al cliente con PDF adjunto.
- **Prioridad**: Alta
- **Contenido del email**:
  - Saludo personalizado
  - Resumen de la factura
  - PDF adjunto
  - Información de contacto

#### RF-025: Visualización de Facturas
- **Descripción**: El sistema debe permitir visualizar PDFs de facturas sin necesidad de emitir.
- **Prioridad**: Media
- **Funcionalidad**: Vista previa en modal

#### RF-026: Edición de Facturas
- **Descripción**: El sistema debe permitir editar facturas no emitidas.
- **Prioridad**: Alta
- **Restricción**: Solo facturas con estado "Pendiente" y no emitidas

#### RF-027: Eliminación de Facturas (Admin)
- **Descripción**: Solo administradores pueden eliminar facturas.
- **Prioridad**: Media
- **Precondición**: Confirmar acción de eliminación

#### RF-028: Filtrado de Facturas
- **Descripción**: El sistema debe permitir filtrar facturas por estado de pago.
- **Prioridad**: Media
- **Opciones**: Todas, Pendiente, Pagada, Anulada

#### RF-029: Búsqueda de Facturas
- **Descripción**: El sistema debe permitir buscar facturas por número, cliente o identificación.
- **Prioridad**: Media
- **Entradas**: Texto de búsqueda
- **Salidas**: Lista de facturas coincidentes

#### RF-030: Paginación de Facturas
- **Descripción**: El sistema debe paginar la lista de facturas.
- **Prioridad**: Baja
- **Configuración**: 30 facturas por página

### 1.5 Gestión de Perfil de Usuario

#### RF-031: Visualización de Perfil
- **Descripción**: El usuario debe poder ver su información de perfil.
- **Prioridad**: Media
- **Datos mostrados**: Nombre, identificación, email, foto de perfil

#### RF-032: Actualización de Datos Personales
- **Descripción**: El usuario debe poder actualizar su información personal.
- **Prioridad**: Media
- **Datos editables**: Nombre, identificación, email

#### RF-033: Cambio de Contraseña
- **Descripción**: El usuario debe poder cambiar su contraseña.
- **Prioridad**: Alta
- **Validaciones**: Contraseña actual correcta, confirmación de nueva contraseña

#### RF-034: Actualización de Foto de Perfil
- **Descripción**: El usuario debe poder subir y cambiar su foto de perfil.
- **Prioridad**: Baja
- **Formatos**: JPG, PNG
- **Almacenamiento**: Servidor local en /pictures/Profile/

### 1.6 Reportes

#### RF-035: Generación de Reportes
- **Descripción**: El sistema debe generar reportes de facturación.
- **Prioridad**: Media
- **Tipos**: Por período, por cliente, por estado
- **Formatos**: Visualización en pantalla, exportación a Excel

#### RF-036: Análisis de Ventas
- **Descripción**: El sistema debe mostrar análisis de ventas con gráficos.
- **Prioridad**: Baja
- **Métricas**: Total vendido, facturas por estado, top clientes

### 1.7 Interfaz de Usuario

#### RF-037: Modo Claro/Oscuro
- **Descripción**: El sistema debe permitir cambiar entre modo claro y oscuro.
- **Prioridad**: Baja
- **Persistencia**: Guardar preferencia en localStorage

#### RF-038: Diseño Responsive
- **Descripción**: El sistema debe ser completamente responsive.
- **Prioridad**: Alta
- **Dispositivos**: Desktop, tablet, móvil

#### RF-039: Navegación por Módulos
- **Descripción**: El sistema debe tener navegación clara entre módulos.
- **Prioridad**: Alta
- **Módulos**: Home, Facturas, Clientes, Productos, Reportes, Perfil, Usuarios

---

## ⚙️ 2. REQUISITOS NO FUNCIONALES

### 2.1 Seguridad

#### RNF-001: Autenticación Segura
- **Descripción**: Implementación de autenticación mediante tokens JWT.
- **Estándar**: JWT con firma HS256
- **Tiempo de expiración**: Configurable

#### RNF-002: Encriptación de Contraseñas
- **Descripción**: Las contraseñas deben almacenarse encriptadas.
- **Algoritmo**: bcryptjs con salt rounds = 10
- **Prioridad**: Crítica

#### RNF-003: Control de Acceso Basado en Roles (RBAC)
- **Descripción**: Implementar control de acceso según roles de usuario.
- **Prioridad**: Alta
- **Niveles**: Admin, Empleado, Usuario

#### RNF-004: Protección de Rutas
- **Descripción**: Las rutas deben estar protegidas y validar autenticación.
- **Prioridad**: Alta
- **Implementación**: Middleware de autenticación

#### RNF-005: Validación de Entradas
- **Descripción**: Todas las entradas del usuario deben ser validadas.
- **Prioridad**: Alta
- **Ubicación**: Cliente y servidor

#### RNF-006: Sanitización de Datos
- **Descripción**: Prevenir inyecciones SQL y XSS.
- **Prioridad**: Crítica
- **Método**: Uso de consultas preparadas (prepared statements)

### 2.2 Rendimiento

#### RNF-007: Tiempo de Respuesta
- **Descripción**: Las operaciones CRUD deben responder en menos de 2 segundos.
- **Prioridad**: Alta
- **Medición**: Tiempo desde petición hasta respuesta

#### RNF-008: Optimización de Consultas
- **Descripción**: Las consultas a base de datos deben estar optimizadas.
- **Prioridad**: Media
- **Métodos**: Índices, joins eficientes, caché de esquema

#### RNF-009: Paginación de Datos
- **Descripción**: Implementar paginación para grandes volúmenes de datos.
- **Prioridad**: Media
- **Tamaño de página**: 30 registros

#### RNF-010: Gestión de Conexiones a BD
- **Descripción**: Uso de pool de conexiones para optimizar recursos.
- **Prioridad**: Alta
- **Configuración**: 10 conexiones máximas

### 2.3 Disponibilidad

#### RNF-011: Disponibilidad del Sistema
- **Descripción**: El sistema debe estar disponible 99% del tiempo.
- **Prioridad**: Alta
- **Downtime aceptable**: ~7 horas/mes

#### RNF-012: Manejo de Errores
- **Descripción**: El sistema debe manejar errores gracefully sin crash.
- **Prioridad**: Alta
- **Implementación**: Try-catch, mensajes descriptivos

#### RNF-013: Logging de Errores
- **Descripción**: Registrar errores en consola del servidor.
- **Prioridad**: Media
- **Información**: Timestamp, tipo de error, stack trace

### 2.4 Usabilidad

#### RNF-014: Interfaz Intuitiva
- **Descripción**: La interfaz debe ser fácil de usar sin capacitación previa.
- **Prioridad**: Alta
- **Validación**: Usuarios deben completar tareas básicas en menos de 5 minutos

#### RNF-015: Retroalimentación al Usuario
- **Descripción**: Mostrar mensajes claros de éxito, error y confirmación.
- **Prioridad**: Alta
- **Tipos**: Alertas, modales, mensajes inline

#### RNF-016: Autocompletado
- **Descripción**: Implementar autocompletado en campos de búsqueda.
- **Prioridad**: Media
- **Campos**: Clientes, productos

#### RNF-017: Validaciones en Tiempo Real
- **Descripción**: Validar datos mientras el usuario escribe.
- **Prioridad**: Media
- **Feedback**: Mensajes de error inline

### 2.5 Mantenibilidad

#### RNF-018: Código Documentado
- **Descripción**: El código debe estar comentado y documentado.
- **Prioridad**: Media
- **Estándar**: JSDoc para funciones principales

#### RNF-019: Arquitectura Modular
- **Descripción**: Separación clara entre frontend, backend y base de datos.
- **Prioridad**: Alta
- **Patrón**: MVC modificado

#### RNF-020: Versionamiento
- **Descripción**: Control de versiones mediante Git.
- **Prioridad**: Alta
- **Branching**: Feature branches, main/master

#### RNF-021: Migraciones de Base de Datos
- **Descripción**: Cambios de esquema mediante archivos de migración SQL.
- **Prioridad**: Alta
- **Ubicación**: /Backend/migrations/

### 2.6 Escalabilidad

#### RNF-022: Diseño Escalable
- **Descripción**: Arquitectura que permita crecimiento de usuarios y datos.
- **Prioridad**: Media
- **Capacidad inicial**: 100 usuarios simultáneos

#### RNF-023: Base de Datos Relacional
- **Descripción**: Uso de MySQL para garantizar integridad referencial.
- **Prioridad**: Alta
- **Versión**: MySQL >= 8.0

### 2.7 Portabilidad

#### RNF-024: Multiplataforma
- **Descripción**: El sistema debe funcionar en Windows, macOS y Linux.
- **Prioridad**: Alta
- **Tecnología**: Node.js cross-platform

#### RNF-025: Compatibilidad de Navegadores
- **Descripción**: Compatible con navegadores modernos.
- **Prioridad**: Alta
- **Navegadores**: Chrome, Firefox, Safari, Edge (últimas 2 versiones)

### 2.8 Configurabilidad

#### RNF-026: Variables de Entorno
- **Descripción**: Configuración mediante archivos .env.
- **Prioridad**: Alta
- **Variables**: DB, JWT, Email, Puertos

#### RNF-027: Configuración de Email
- **Descripción**: Configuración de servidor SMTP para envío de emails.
- **Prioridad**: Alta
- **Proveedor**: Nodemailer (compatible con Gmail, Outlook, etc.)

### 2.9 Testing

#### RNF-028: Pruebas E2E
- **Descripción**: Implementación de pruebas end-to-end.
- **Prioridad**: Media
- **Framework**: Playwright
- **Cobertura**: Login, navegación, creación de facturas

#### RNF-029: Reportes de Pruebas
- **Descripción**: Generación automática de reportes de pruebas.
- **Prioridad**: Baja
- **Formatos**: HTML, JSON, XML

### 2.10 Localización

#### RNF-030: Idioma
- **Descripción**: Sistema en español.
- **Prioridad**: Alta
- **Formato de fechas**: DD/MM/YYYY o YYYY-MM-DD

#### RNF-031: Formato de Moneda
- **Descripción**: Valores monetarios con separador de miles y decimales.
- **Prioridad**: Media
- **Formato**: $ 1.234.567,89

---

## 📊 Matriz de Trazabilidad

| Requisito Funcional | Módulo | Prioridad | Estado |
|---------------------|---------|-----------|--------|
| RF-001 a RF-005 | Autenticación | Alta | Implementado |
| RF-006 a RF-010 | Clientes | Alta | Implementado |
| RF-011 a RF-015 | Productos | Alta | Implementado |
| RF-016 a RF-030 | Facturas | Alta | Implementado |
| RF-031 a RF-034 | Perfil | Media | Implementado |
| RF-035 a RF-036 | Reportes | Media | Implementado |
| RF-037 a RF-039 | Interfaz | Alta | Implementado |

---

**Documento creado**: Enero 2026  
**Versión**: 1.0  
**Sistema**: Facturación Electrónica PFEPS
