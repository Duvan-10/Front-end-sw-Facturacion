# Diagrama de Casos de Uso
## Sistema de Facturación Electrónica - PFEPS

---

## 📋 Tabla de Contenidos

1. [Actores del Sistema](#actores-del-sistema)
2. [Diagrama General de Casos de Uso](#diagrama-general-de-casos-de-uso)
3. [Casos de Uso por Módulo](#casos-de-uso-por-módulo)
4. [Especificaciones Detalladas](#especificaciones-detalladas)

---

## 👥 1. Actores del Sistema

### Actor Principal

#### 1.1 Administrador (Admin)
- **Descripción**: Usuario con permisos completos en el sistema
- **Permisos**:
  - ✅ Gestión completa de usuarios (crear, editar, eliminar)
  - ✅ Gestión completa de clientes
  - ✅ Gestión completa de productos
  - ✅ Gestión completa de facturas (incluido eliminar)
  - ✅ Visualización de reportes
  - ✅ Emisión de facturas
  - ✅ Gestión de perfil propio

#### 1.2 Empleado
- **Descripción**: Usuario con permisos operativos
- **Permisos**:
  - ✅ Gestión de clientes (crear, editar, listar)
  - ✅ Gestión de productos (crear, editar, listar)
  - ✅ Gestión de facturas (crear, editar, listar, emitir)
  - ✅ Visualización de reportes
  - ✅ Gestión de perfil propio
  - ❌ NO puede gestionar usuarios
  - ❌ NO puede eliminar facturas

#### 1.3 Usuario
- **Descripción**: Usuario con permisos de solo lectura
- **Permisos**:
  - ✅ Visualizar clientes
  - ✅ Visualizar productos
  - ✅ Visualizar facturas
  - ✅ Visualizar reportes
  - ✅ Gestión de perfil propio
  - ❌ NO puede crear, editar ni eliminar

### Actores Secundarios

#### 1.4 Sistema de Email
- **Descripción**: Servicio externo para envío de facturas
- **Protocolo**: SMTP (Nodemailer)
- **Función**: Enviar facturas por correo electrónico

#### 1.5 Base de Datos MySQL
- **Descripción**: Sistema de almacenamiento persistente
- **Función**: Almacenar y recuperar datos del sistema

---

## 🎯 2. Diagrama General de Casos de Uso

```
                    Sistema de Facturación Electrónica
    ═════════════════════════════════════════════════════════════════

                            ┌─────────────────┐
                            │                 │
                            │  ADMINISTRADOR  │
                            │                 │
                            └────────┬────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
        ┌──────────────────┐  ┌──────────────┐  ┌──────────────┐
        │ Gestionar        │  │ Gestionar    │  │ Gestionar    │
        │ Usuarios         │  │ Facturas     │  │ Clientes     │
        └──────────────────┘  └──────┬───────┘  └──────────────┘
                ▲                    │                  ▲
                │                    │                  │
                │                    ▼                  │
                │            ┌───────────────┐          │
                │            │ Emitir        │          │
                │            │ Factura       │◄─────────┤
                │            └───────┬───────┘          │
                │                    │                  │
                │                    │ «include»        │
                │                    ▼                  │
                │            ┌───────────────┐          │
                │            │ Generar PDF   │          │
                │            └───────┬───────┘          │
                │                    │                  │
                │                    │ «include»        │
                │                    ▼                  │
                │            ┌───────────────┐          │
                │            │ Enviar Email  │          │
                │            └───────────────┘          │
                │                                       │
                │                                       │
                │            ┌──────────────┐           │
                └────────────┤  EMPLEADO    ├───────────┘
                             └──────┬───────┘
                                    │
                                    │
                                    ▼
                            ┌──────────────┐
                            │ Gestionar    │
                            │ Productos    │
                            └──────────────┘
                                    ▲
                                    │
                                    │
                             ┌──────┴───────┐
                             │   USUARIO    │
                             │ (solo vista) │
                             └──────────────┘


    ─────────────────────────────────────────────────────────────────
                            Casos de Uso Comunes
    ─────────────────────────────────────────────────────────────────

            ┌──────────────┐         ┌──────────────┐
            │ Iniciar      │         │ Gestionar    │
            │ Sesión       │         │ Perfil       │
            └──────────────┘         └──────────────┘
                   ▲                        ▲
                   │                        │
                   └────────┬───────────────┘
                            │
                    ┌───────┴────────┐
                    │  TODOS LOS     │
                    │  USUARIOS      │
                    └────────────────┘
```

---

## 📦 3. Casos de Uso por Módulo

### 3.1 Módulo de Autenticación

```
┌─────────────────────────────────────────────┐
│         MÓDULO DE AUTENTICACIÓN             │
├─────────────────────────────────────────────┤
│                                             │
│  (CU-001) Registrar Primer Usuario         │
│     Actor: Sistema / Primer Administrador  │
│     Precondición: No existen usuarios      │
│                                             │
│  (CU-002) Iniciar Sesión                   │
│     Actor: Todos los usuarios              │
│     Precondición: Usuario registrado       │
│                                             │
│  (CU-003) Cerrar Sesión                    │
│     Actor: Usuarios autenticados           │
│     Precondición: Sesión activa            │
│                                             │
│  (CU-004) Recuperar Contraseña             │
│     Actor: Usuario registrado              │
│     Precondición: Email válido             │
│     Incluye: Enviar email con token        │
│                                             │
│  (CU-005) Restablecer Contraseña           │
│     Actor: Usuario con token válido        │
│     Precondición: Token no expirado (1h)   │
│                                             │
└─────────────────────────────────────────────┘
```

### 3.2 Módulo de Gestión de Usuarios

```
┌─────────────────────────────────────────────┐
│      MÓDULO DE GESTIÓN DE USUARIOS          │
├─────────────────────────────────────────────┤
│                                             │
│  (CU-006) Listar Usuarios                  │
│     Actor: Administrador                   │
│     Postcondición: Vista de usuarios       │
│                                             │
│  (CU-007) Crear Usuario                    │
│     Actor: Administrador                   │
│     Incluye: Asignar rol                   │
│     Postcondición: Usuario creado          │
│                                             │
│  (CU-008) Editar Usuario                   │
│     Actor: Administrador                   │
│     Postcondición: Usuario actualizado     │
│                                             │
│  (CU-009) Eliminar Usuario                 │
│     Actor: Administrador                   │
│     Precondición: Confirmación             │
│     Postcondición: Usuario eliminado       │
│                                             │
│  (CU-010) Buscar Usuario                   │
│     Actor: Administrador                   │
│     Postcondición: Lista filtrada          │
│                                             │
└─────────────────────────────────────────────┘
```

### 3.3 Módulo de Gestión de Clientes

```
┌─────────────────────────────────────────────┐
│      MÓDULO DE GESTIÓN DE CLIENTES          │
├─────────────────────────────────────────────┤
│                                             │
│  (CU-011) Listar Clientes                  │
│     Actor: Admin, Empleado, Usuario        │
│     Postcondición: Vista de clientes       │
│                                             │
│  (CU-012) Crear Cliente                    │
│     Actor: Admin, Empleado                 │
│     Precondición: Identificación única     │
│     Postcondición: Cliente creado          │
│                                             │
│  (CU-013) Editar Cliente                   │
│     Actor: Admin, Empleado                 │
│     Postcondición: Cliente actualizado     │
│                                             │
│  (CU-014) Eliminar Cliente                 │
│     Actor: Admin, Empleado                 │
│     Precondición: Sin facturas asociadas   │
│     Postcondición: Cliente eliminado       │
│                                             │
│  (CU-015) Buscar Cliente                   │
│     Actor: Admin, Empleado, Usuario        │
│     Búsqueda por: ID, nombre, email        │
│     Postcondición: Lista filtrada          │
│                                             │
│  (CU-016) Autocompletar Cliente            │
│     Actor: Admin, Empleado (en factura)    │
│     Trigger: Ingreso de identificación     │
│     Postcondición: Datos autocompletados   │
│                                             │
└─────────────────────────────────────────────┘
```

### 3.4 Módulo de Gestión de Productos

```
┌─────────────────────────────────────────────┐
│      MÓDULO DE GESTIÓN DE PRODUCTOS         │
├─────────────────────────────────────────────┤
│                                             │
│  (CU-017) Listar Productos                 │
│     Actor: Admin, Empleado, Usuario        │
│     Postcondición: Vista de productos      │
│                                             │
│  (CU-018) Crear Producto                   │
│     Actor: Admin, Empleado                 │
│     Precondición: Código único             │
│     Validación: Precio no negativo         │
│     Postcondición: Producto creado         │
│                                             │
│  (CU-019) Editar Producto                  │
│     Actor: Admin, Empleado                 │
│     Postcondición: Producto actualizado    │
│                                             │
│  (CU-020) Eliminar Producto                │
│     Actor: Admin, Empleado                 │
│     Precondición: Sin facturas activas     │
│     Postcondición: Producto eliminado      │
│                                             │
│  (CU-021) Buscar Producto                  │
│     Actor: Admin, Empleado, Usuario        │
│     Búsqueda por: Código, nombre           │
│     Postcondición: Lista filtrada          │
│                                             │
│  (CU-022) Autocompletar Producto           │
│     Actor: Admin, Empleado (en factura)    │
│     Trigger: Ingreso de código             │
│     Postcondición: Datos autocompletados   │
│                                             │
└─────────────────────────────────────────────┘
```

### 3.5 Módulo de Gestión de Facturas

```
┌──────────────────────────────────────────────────┐
│      MÓDULO DE GESTIÓN DE FACTURAS               │
├──────────────────────────────────────────────────┤
│                                                  │
│  (CU-023) Listar Facturas                       │
│     Actor: Admin, Empleado, Usuario             │
│     Postcondición: Vista de facturas            │
│                                                  │
│  (CU-024) Crear Factura (Cliente Existente)    │
│     Actor: Admin, Empleado                      │
│     Incluye: CU-016, CU-022, CU-030            │
│     Postcondición: Factura creada               │
│                                                  │
│  (CU-025) Crear Factura (Cliente Nuevo)        │
│     Actor: Admin, Empleado                      │
│     Incluye: CU-012, CU-024                    │
│     Postcondición: Cliente y factura creados    │
│                                                  │
│  (CU-026) Editar Factura                        │
│     Actor: Admin, Empleado                      │
│     Precondición: Factura no emitida            │
│     Postcondición: Factura actualizada          │
│                                                  │
│  (CU-027) Eliminar Factura                      │
│     Actor: Administrador únicamente             │
│     Precondición: Confirmación de usuario       │
│     Postcondición: Factura eliminada            │
│                                                  │
│  (CU-028) Cambiar Estado de Factura            │
│     Actor: Admin, Empleado                      │
│     Estados: Pendiente, Pagada, Parcial,        │
│              Vencida, Anulada                   │
│     Postcondición: Estado actualizado           │
│                                                  │
│  (CU-029) Visualizar Factura (PDF)             │
│     Actor: Admin, Empleado, Usuario             │
│     Incluye: CU-030 (sin guardar)              │
│     Postcondición: Vista previa en modal        │
│                                                  │
│  (CU-030) Generar PDF de Factura               │
│     Actor: Sistema (automático)                 │
│     Trigger: Emisión de factura                 │
│     Postcondición: PDF creado                   │
│                                                  │
│  (CU-031) Emitir Factura                       │
│     Actor: Admin, Empleado                      │
│     Precondición: Factura válida, estado        │
│                   no "Anulada" o "Vencida"      │
│     Incluye: CU-030, CU-032                    │
│     Postcondición: Factura emitida, PDF         │
│                    enviado por email            │
│                                                  │
│  (CU-032) Enviar Factura por Email             │
│     Actor: Sistema de Email (SMTP)              │
│     Precondición: Email válido del cliente      │
│     Postcondición: Email enviado con PDF        │
│                    adjunto                      │
│                                                  │
│  (CU-033) Buscar Factura                       │
│     Actor: Admin, Empleado, Usuario             │
│     Búsqueda por: Número, cliente, ID           │
│     Postcondición: Lista filtrada               │
│                                                  │
│  (CU-034) Filtrar Facturas por Estado          │
│     Actor: Admin, Empleado, Usuario             │
│     Filtros: Todas, Pendiente, Pagada,          │
│              Anulada                            │
│     Postcondición: Lista filtrada               │
│                                                  │
└──────────────────────────────────────────────────┘
```

### 3.6 Módulo de Perfil de Usuario

```
┌─────────────────────────────────────────────┐
│      MÓDULO DE PERFIL DE USUARIO            │
├─────────────────────────────────────────────┤
│                                             │
│  (CU-035) Visualizar Perfil Propio         │
│     Actor: Todos los usuarios autenticados │
│     Postcondición: Vista de datos propios  │
│                                             │
│  (CU-036) Actualizar Datos Personales      │
│     Actor: Todos los usuarios autenticados │
│     Campos: Nombre, identificación, email  │
│     Postcondición: Datos actualizados      │
│                                             │
│  (CU-037) Cambiar Contraseña               │
│     Actor: Todos los usuarios autenticados │
│     Precondición: Contraseña actual válida │
│     Postcondición: Contraseña actualizada  │
│                                             │
│  (CU-038) Actualizar Foto de Perfil        │
│     Actor: Todos los usuarios autenticados │
│     Formatos: JPG, PNG                     │
│     Postcondición: Foto actualizada        │
│                                             │
└─────────────────────────────────────────────┘
```

### 3.7 Módulo de Reportes

```
┌─────────────────────────────────────────────┐
│         MÓDULO DE REPORTES                  │
├─────────────────────────────────────────────┤
│                                             │
│  (CU-039) Visualizar Dashboard             │
│     Actor: Admin, Empleado, Usuario        │
│     Postcondición: Métricas generales      │
│                                             │
│  (CU-040) Generar Reporte de Ventas        │
│     Actor: Admin, Empleado, Usuario        │
│     Parámetros: Fecha inicio/fin           │
│     Postcondición: Reporte generado        │
│                                             │
│  (CU-041) Exportar Reporte a Excel         │
│     Actor: Admin, Empleado                 │
│     Formato: .xlsx                         │
│     Postcondición: Archivo descargado      │
│                                             │
│  (CU-042) Filtrar Reportes                 │
│     Actor: Admin, Empleado, Usuario        │
│     Filtros: Por período, cliente, estado  │
│     Postcondición: Datos filtrados         │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 📄 4. Especificaciones Detalladas de Casos de Uso

### CU-001: Registrar Primer Usuario

**Actor Principal**: Primer Administrador  
**Objetivo**: Crear el primer usuario del sistema con rol de administrador  
**Precondiciones**:
- No deben existir usuarios en la base de datos
- Sistema instalado y base de datos configurada

**Flujo Principal**:
1. Usuario accede a `/register`
2. Sistema verifica que no existen usuarios
3. Sistema muestra formulario de registro
4. Usuario ingresa: nombre, identificación, email, contraseña
5. Sistema valida los datos
6. Sistema encripta la contraseña con bcrypt
7. Sistema crea el usuario con rol "admin"
8. Sistema genera token JWT
9. Sistema redirige a `/home`

**Flujos Alternativos**:
- **FA-1**: Ya existen usuarios → Sistema redirige a `/login`
- **FA-2**: Datos inválidos → Sistema muestra errores de validación
- **FA-3**: Email duplicado → Sistema muestra error

**Postcondiciones**:
- Usuario administrador creado en la BD
- Usuario autenticado con token JWT
- Usuario redirigido al home

---

### CU-002: Iniciar Sesión

**Actor Principal**: Usuario registrado  
**Objetivo**: Autenticarse en el sistema  
**Precondiciones**:
- Usuario registrado en el sistema

**Flujo Principal**:
1. Usuario accede a `/login`
2. Usuario ingresa email y contraseña
3. Sistema valida el formato de los datos
4. Sistema busca el usuario por email
5. Sistema compara la contraseña con bcrypt.compare()
6. Sistema genera token JWT con datos: id, email, role
7. Sistema guarda token en sessionStorage
8. Sistema actualiza contexto de autenticación
9. Sistema redirige a `/home`

**Flujos Alternativos**:
- **FA-1**: Usuario no existe → "Credenciales inválidas"
- **FA-2**: Contraseña incorrecta → "Credenciales inválidas"
- **FA-3**: Error de servidor → Mensaje de error genérico

**Postcondiciones**:
- Usuario autenticado
- Token JWT almacenado en sessionStorage
- Context API actualizado con datos del usuario

---

### CU-024: Crear Factura (Cliente Existente)

**Actor Principal**: Admin o Empleado  
**Objetivo**: Crear una nueva factura para un cliente existente  
**Precondiciones**:
- Usuario autenticado con rol Admin o Empleado
- Al menos un cliente registrado
- Al menos un producto registrado

**Flujo Principal**:
1. Usuario hace clic en "Nueva Factura" → "Cliente Existente"
2. Sistema muestra formulario de factura
3. Sistema obtiene y muestra número de factura automático
4. Usuario ingresa identificación del cliente
5. Sistema autocompleta datos del cliente (CU-016)
6. Usuario agrega productos:
   - Ingresa código del producto
   - Sistema autocompleta datos del producto (CU-022)
   - Usuario ingresa cantidad y descuento
   - Sistema calcula totales automáticamente
7. Usuario ingresa fecha de vencimiento
8. Usuario hace clic en "Crear Factura"
9. Sistema valida todos los datos:
   - Cliente existe en BD
   - Productos existen en BD
   - Cantidades > 0
   - Fecha de vencimiento válida
10. Sistema inicia transacción en BD
11. Sistema inserta factura en tabla `facturas`:
    - numero_factura (automático)
    - cliente_id
    - fecha_creacion (NOW())
    - fecha_vencimiento
    - subtotal, iva, total (calculados)
    - estado: "Pendiente"
    - estado_emision: "pendiente"
12. Sistema inserta detalles en tabla `factura_detalles`:
    - factura_id
    - producto_id
    - cantidad
    - precio_unitario
    - descuento
    - subtotal, total
13. Sistema confirma transacción (COMMIT)
14. Sistema muestra mensaje de éxito
15. Sistema cierra modal de formulario
16. Sistema actualiza lista de facturas

**Flujos Alternativos**:
- **FA-1**: Cliente no existe → Error de validación
- **FA-2**: Producto no existe → Error de validación
- **FA-3**: Cantidad inválida → Error de validación
- **FA-4**: Error en BD → ROLLBACK, mostrar error
- **FA-5**: Usuario cancela → Cerrar modal sin guardar

**Postcondiciones**:
- Factura creada en BD con estado "Pendiente"
- Detalles de factura guardados
- Lista de facturas actualizada

---

### CU-031: Emitir Factura

**Actor Principal**: Admin o Empleado  
**Objetivo**: Emitir una factura generando PDF y enviándola por email  
**Precondiciones**:
- Factura existe en BD
- Factura tiene estado diferente de "Anulada" o "Vencida"
- Cliente tiene email válido

**Flujo Principal**:
1. Usuario hace clic en botón "Emitir" (📤) en la lista de facturas
2. Sistema solicita confirmación al usuario
3. Usuario confirma la emisión
4. Sistema muestra indicador de carga
5. Sistema obtiene datos completos de la factura:
   - Datos de la factura
   - Datos del cliente
   - Detalles de productos
6. Sistema genera PDF de la factura (CU-030):
   - Renderiza HTML con datos de la factura
   - Convierte HTML a PDF con Puppeteer
   - Guarda PDF temporalmente
7. Sistema envía email con Nodemailer (CU-032):
   - Destinatario: email del cliente
   - Asunto: "Factura #[numero] - [Razón Social]"
   - Cuerpo: HTML con resumen de factura
   - Adjunto: PDF de la factura
8. Sistema actualiza estado_emision a "emitida"
9. Sistema actualiza fecha_emision a NOW()
10. Sistema elimina PDF temporal
11. Sistema muestra mensaje de éxito con datos del envío
12. Sistema actualiza lista de facturas

**Flujos Alternativos**:
- **FA-1**: Cliente sin email → Error: "Cliente no tiene email"
- **FA-2**: Factura anulada → Error: "No se puede emitir factura anulada"
- **FA-3**: Factura vencida → Confirmar si desea emitir de todas formas
- **FA-4**: Error al generar PDF → estado_emision: "error", mostrar error
- **FA-5**: Error al enviar email → estado_emision: "error", mostrar error
- **FA-6**: Usuario cancela → No realizar acción

**Postcondiciones**:
- PDF de factura generado
- Email enviado al cliente con PDF adjunto
- estado_emision actualizado a "emitida"
- fecha_emision registrada
- Lista de facturas actualizada

---

### CU-035: Visualizar Perfil Propio

**Actor Principal**: Usuario autenticado  
**Objetivo**: Ver información del perfil propio  
**Precondiciones**:
- Usuario autenticado

**Flujo Principal**:
1. Usuario hace clic en "Perfil" en el menú
2. Sistema obtiene datos del usuario desde BD:
   - id, name, identification, email, role, profile_photo
3. Sistema muestra datos en pantalla:
   - Foto de perfil (o placeholder si no tiene)
   - Nombre completo
   - Identificación
   - Email
   - Rol
4. Sistema muestra opciones de edición

**Postcondiciones**:
- Datos del perfil mostrados

---

## 🔄 Relaciones entre Casos de Uso

### Relaciones de Inclusión («include»)

```
CU-024 (Crear Factura)
    ├── include → CU-016 (Autocompletar Cliente)
    └── include → CU-022 (Autocompletar Producto)

CU-025 (Crear Factura Cliente Nuevo)
    ├── include → CU-012 (Crear Cliente)
    └── include → CU-024 (Crear Factura)

CU-031 (Emitir Factura)
    ├── include → CU-030 (Generar PDF)
    └── include → CU-032 (Enviar Email)

CU-041 (Exportar Reporte)
    └── include → CU-040 (Generar Reporte)
```

### Relaciones de Extensión («extend»)

```
CU-004 (Recuperar Contraseña)
    └── extend → CU-032 (Enviar Email)

CU-028 (Cambiar Estado)
    └── extend → CU-023 (Listar Facturas)

CU-034 (Filtrar Facturas)
    └── extend → CU-023 (Listar Facturas)
```

---

## 📊 Matriz de Trazabilidad Actores-Casos de Uso

| Caso de Uso | Admin | Empleado | Usuario | Sistema |
|-------------|:-----:|:--------:|:-------:|:-------:|
| CU-001: Registrar Primer Usuario | ✅ | - | - | - |
| CU-002: Iniciar Sesión | ✅ | ✅ | ✅ | - |
| CU-003: Cerrar Sesión | ✅ | ✅ | ✅ | - |
| CU-004: Recuperar Contraseña | ✅ | ✅ | ✅ | - |
| CU-005: Restablecer Contraseña | ✅ | ✅ | ✅ | - |
| CU-006: Listar Usuarios | ✅ | - | - | - |
| CU-007: Crear Usuario | ✅ | - | - | - |
| CU-008: Editar Usuario | ✅ | - | - | - |
| CU-009: Eliminar Usuario | ✅ | - | - | - |
| CU-010: Buscar Usuario | ✅ | - | - | - |
| CU-011: Listar Clientes | ✅ | ✅ | 👁️ | - |
| CU-012: Crear Cliente | ✅ | ✅ | - | - |
| CU-013: Editar Cliente | ✅ | ✅ | - | - |
| CU-014: Eliminar Cliente | ✅ | ✅ | - | - |
| CU-015: Buscar Cliente | ✅ | ✅ | 👁️ | - |
| CU-016: Autocompletar Cliente | ✅ | ✅ | - | ✅ |
| CU-017: Listar Productos | ✅ | ✅ | 👁️ | - |
| CU-018: Crear Producto | ✅ | ✅ | - | - |
| CU-019: Editar Producto | ✅ | ✅ | - | - |
| CU-020: Eliminar Producto | ✅ | ✅ | - | - |
| CU-021: Buscar Producto | ✅ | ✅ | 👁️ | - |
| CU-022: Autocompletar Producto | ✅ | ✅ | - | ✅ |
| CU-023: Listar Facturas | ✅ | ✅ | 👁️ | - |
| CU-024: Crear Factura (Existente) | ✅ | ✅ | - | - |
| CU-025: Crear Factura (Nuevo) | ✅ | ✅ | - | - |
| CU-026: Editar Factura | ✅ | ✅ | - | - |
| CU-027: Eliminar Factura | ✅ | - | - | - |
| CU-028: Cambiar Estado Factura | ✅ | ✅ | - | - |
| CU-029: Visualizar Factura PDF | ✅ | ✅ | 👁️ | - |
| CU-030: Generar PDF | - | - | - | ✅ |
| CU-031: Emitir Factura | ✅ | ✅ | - | - |
| CU-032: Enviar Email | - | - | - | ✅ |
| CU-033: Buscar Factura | ✅ | ✅ | 👁️ | - |
| CU-034: Filtrar Facturas | ✅ | ✅ | 👁️ | - |
| CU-035: Visualizar Perfil | ✅ | ✅ | ✅ | - |
| CU-036: Actualizar Datos | ✅ | ✅ | ✅ | - |
| CU-037: Cambiar Contraseña | ✅ | ✅ | ✅ | - |
| CU-038: Actualizar Foto | ✅ | ✅ | ✅ | - |
| CU-039: Ver Dashboard | ✅ | ✅ | 👁️ | - |
| CU-040: Generar Reporte | ✅ | ✅ | 👁️ | - |
| CU-041: Exportar a Excel | ✅ | ✅ | - | - |
| CU-042: Filtrar Reportes | ✅ | ✅ | 👁️ | - |

**Leyenda**:
- ✅ = Puede ejecutar y modificar
- 👁️ = Solo puede visualizar
- - = Sin acceso

---

**Documento creado**: Enero 2026  
**Versión**: 1.0  
**Sistema**: Facturación Electrónica PFEPS
