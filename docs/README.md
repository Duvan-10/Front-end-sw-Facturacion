# Documentación Técnica Completa
## Sistema de Facturación Electrónica - PFEPS

---

## 📚 Índice de Documentación

Bienvenido a la documentación técnica completa del Sistema de Facturación Electrónica PFEPS. Esta documentación ha sido organizada en documentos independientes para facilitar su consulta y mantenimiento.

---

## 📋 Documentos Disponibles

### 1. [Requisitos Funcionales y No Funcionales](./01-REQUISITOS-FUNCIONALES-NO-FUNCIONALES.md)
**Contenido**:
- 39 Requisitos Funcionales detallados
- 31 Requisitos No Funcionales
- Requisitos de autenticación, usuarios, clientes, productos, facturas, perfil y reportes
- Requisitos de seguridad, rendimiento, disponibilidad, usabilidad y testing
- Matriz de trazabilidad

**Cuándo consultar**: Para entender qué hace el sistema y sus características

---

### 2. [Prerrequisitos de Instalación](./02-PRERREQUISITOS-INSTALACION.md)
**Contenido**:
- Requisitos de hardware (mínimos y recomendados)
- Requisitos de software (Node.js, MySQL, Git)
- Instalación de MySQL paso a paso
- Configuración de base de datos
- Variables de entorno (.env)
- Checklist de verificación
- Solución de problemas comunes

**Cuándo consultar**: Antes de instalar el sistema, para preparar el entorno

---

### 3. [Frameworks y Estándares](./03-FRAMEWORKS-Y-ESTANDARES.md)
**Contenido**:
- Arquitectura de tres capas
- Stack tecnológico completo
- Tecnologías Backend (Express, MySQL2, bcrypt, JWT, Nodemailer, Puppeteer)
- Tecnologías Frontend (React, Vite, React Router)
- Base de datos MySQL
- Estándares de desarrollo y nomenclatura
- Patrones de diseño utilizados
- Herramientas de testing (Playwright)

**Cuándo consultar**: Para entender las tecnologías y arquitectura del sistema

---

### 4. [Diagrama de Casos de Uso](./04-DIAGRAMA-CASOS-DE-USO.md)
**Contenido**:
- Actores del sistema (Admin, Empleado, Usuario)
- 42 Casos de uso detallados
- Diagramas de casos de uso por módulo
- Especificaciones completas de casos de uso principales
- Relaciones entre casos de uso
- Matriz de trazabilidad actores-casos de uso

**Cuándo consultar**: Para entender cómo interactúan los usuarios con el sistema

---

### 5. [Diccionario de Datos](./05-DICCIONARIO-DE-DATOS.md)
**Contenido**:
- 6 Tablas del sistema (users, clientes, productos, facturas, factura_detalles, reportes)
- Descripción completa de cada columna
- Tipos de datos, constraints y validaciones
- Relaciones entre tablas (claves foráneas)
- Índices y optimizaciones
- Consultas SQL comunes
- Estadísticas de almacenamiento

**Cuándo consultar**: Para entender la estructura de la base de datos

---

### 6. [Scripts de Instalación](./06-SCRIPTS-INSTALACION.md)
**Contenido**:
- Script de instalación automática (Windows y Linux/macOS)
- Scripts SQL de creación de base de datos
- Scripts SQL de creación de tablas
- Script de datos de prueba (seed)
- Scripts de validación de instalación
- Scripts de inicio del sistema
- Scripts de migración
- Script de diagnóstico

**Cuándo consultar**: Durante la instalación y configuración inicial del sistema

---

### 7. [Diagrama de Componentes](./07-DIAGRAMA-COMPONENTES.md)
**Contenido**:
- Arquitectura general del sistema
- Componentes del Backend (routes, controllers, middleware, models, config)
- Componentes del Frontend (Auth, modules, forms, components, context)
- Interacciones entre componentes
- Flujos de datos (autenticación, creación de factura, emisión)
- Interfaces de comunicación (API REST)
- Dependencias entre componentes

**Cuándo consultar**: Para entender la arquitectura interna y cómo funcionan los componentes

---

## 🗂️ Organización de la Documentación

```
docs/
├── README.md                                    ← Este archivo (índice)
├── 01-REQUISITOS-FUNCIONALES-NO-FUNCIONALES.md
├── 02-PRERREQUISITOS-INSTALACION.md
├── 03-FRAMEWORKS-Y-ESTANDARES.md
├── 04-DIAGRAMA-CASOS-DE-USO.md
├── 05-DICCIONARIO-DE-DATOS.md
├── 06-SCRIPTS-INSTALACION.md
└── 07-DIAGRAMA-COMPONENTES.md
```

---

## 🚀 Guía de Inicio Rápido

### Para Desarrolladores Nuevos

1. **Primeros pasos**:
   - Leer [02-PRERREQUISITOS-INSTALACION.md](./02-PRERREQUISITOS-INSTALACION.md)
   - Leer [03-FRAMEWORKS-Y-ESTANDARES.md](./03-FRAMEWORKS-Y-ESTANDARES.md)
   - Leer [07-DIAGRAMA-COMPONENTES.md](./07-DIAGRAMA-COMPONENTES.md)

2. **Instalar el sistema**:
   - Seguir [06-SCRIPTS-INSTALACION.md](./06-SCRIPTS-INSTALACION.md)
   - Ejecutar scripts de instalación
   - Verificar funcionamiento

3. **Entender el negocio**:
   - Leer [01-REQUISITOS-FUNCIONALES-NO-FUNCIONALES.md](./01-REQUISITOS-FUNCIONALES-NO-FUNCIONALES.md)
   - Leer [04-DIAGRAMA-CASOS-DE-USO.md](./04-DIAGRAMA-CASOS-DE-USO.md)

4. **Trabajar con la base de datos**:
   - Consultar [05-DICCIONARIO-DE-DATOS.md](./05-DICCIONARIO-DE-DATOS.md)

### Para Administradores de Sistema

1. **Instalación**:
   - [02-PRERREQUISITOS-INSTALACION.md](./02-PRERREQUISITOS-INSTALACION.md)
   - [06-SCRIPTS-INSTALACION.md](./06-SCRIPTS-INSTALACION.md)

2. **Configuración**:
   - Variables de entorno (.env)
   - Base de datos MySQL
   - Servidor SMTP para emails

3. **Mantenimiento**:
   - Respaldos de base de datos
   - Monitoreo de logs
   - Actualizaciones

### Para Analistas y Testers

1. **Requisitos del sistema**:
   - [01-REQUISITOS-FUNCIONALES-NO-FUNCIONALES.md](./01-REQUISITOS-FUNCIONALES-NO-FUNCIONALES.md)

2. **Casos de uso**:
   - [04-DIAGRAMA-CASOS-DE-USO.md](./04-DIAGRAMA-CASOS-DE-USO.md)

3. **Flujos del sistema**:
   - [07-DIAGRAMA-COMPONENTES.md](./07-DIAGRAMA-COMPONENTES.md) (Sección 4: Interacciones)

---

## 📊 Información del Sistema

### Resumen Ejecutivo

**Nombre**: Sistema de Facturación Electrónica PFEPS  
**Versión**: 1.0  
**Tipo**: Aplicación Web (SPA)  
**Arquitectura**: Cliente-Servidor (3 capas)

**Tecnologías principales**:
- Frontend: React 19.2 + Vite 7.2
- Backend: Node.js 18 + Express 5.2
- Base de Datos: MySQL 8.0+

**Módulos**:
1. Autenticación y Usuarios
2. Gestión de Clientes
3. Gestión de Productos
4. Gestión de Facturas
5. Perfil de Usuario
6. Reportes

**Roles de Usuario**:
- Administrador (acceso total)
- Empleado (operaciones CRUD)
- Usuario (solo lectura)

---

## 🔍 Búsqueda Rápida

### Por Tema

| Tema | Documento |
|------|-----------|
| ¿Qué hace el sistema? | [01-REQUISITOS-FUNCIONALES-NO-FUNCIONALES.md](./01-REQUISITOS-FUNCIONALES-NO-FUNCIONALES.md) |
| ¿Cómo instalarlo? | [02-PRERREQUISITOS-INSTALACION.md](./02-PRERREQUISITOS-INSTALACION.md), [06-SCRIPTS-INSTALACION.md](./06-SCRIPTS-INSTALACION.md) |
| ¿Qué tecnologías usa? | [03-FRAMEWORKS-Y-ESTANDARES.md](./03-FRAMEWORKS-Y-ESTANDARES.md) |
| ¿Cómo funciona? | [04-DIAGRAMA-CASOS-DE-USO.md](./04-DIAGRAMA-CASOS-DE-USO.md), [07-DIAGRAMA-COMPONENTES.md](./07-DIAGRAMA-COMPONENTES.md) |
| ¿Estructura de BD? | [05-DICCIONARIO-DE-DATOS.md](./05-DICCIONARIO-DE-DATOS.md) |
| Scripts de instalación | [06-SCRIPTS-INSTALACION.md](./06-SCRIPTS-INSTALACION.md) |
| Arquitectura del código | [07-DIAGRAMA-COMPONENTES.md](./07-DIAGRAMA-COMPONENTES.md) |

### Por Rol

#### Desarrollador Backend
- [03-FRAMEWORKS-Y-ESTANDARES.md](./03-FRAMEWORKS-Y-ESTANDARES.md) (Sección 2)
- [05-DICCIONARIO-DE-DATOS.md](./05-DICCIONARIO-DE-DATOS.md)
- [07-DIAGRAMA-COMPONENTES.md](./07-DIAGRAMA-COMPONENTES.md) (Sección 2)

#### Desarrollador Frontend
- [03-FRAMEWORKS-Y-ESTANDARES.md](./03-FRAMEWORKS-Y-ESTANDARES.md) (Sección 3)
- [07-DIAGRAMA-COMPONENTES.md](./07-DIAGRAMA-COMPONENTES.md) (Sección 3)

#### DBA
- [02-PRERREQUISITOS-INSTALACION.md](./02-PRERREQUISITOS-INSTALACION.md) (Sección 4)
- [05-DICCIONARIO-DE-DATOS.md](./05-DICCIONARIO-DE-DATOS.md)
- [06-SCRIPTS-INSTALACION.md](./06-SCRIPTS-INSTALACION.md) (Sección 2)

#### Analista de Negocio
- [01-REQUISITOS-FUNCIONALES-NO-FUNCIONALES.md](./01-REQUISITOS-FUNCIONALES-NO-FUNCIONALES.md)
- [04-DIAGRAMA-CASOS-DE-USO.md](./04-DIAGRAMA-CASOS-DE-USO.md)

---

## 📝 Convenciones de la Documentación

### Formato de los Documentos

Todos los documentos siguen el siguiente formato:

1. **Título principal**: Nombre del documento
2. **Subtítulo**: Sistema de Facturación Electrónica - PFEPS
3. **Tabla de contenidos**: Enlaces a las secciones principales
4. **Contenido**: Organizado en secciones numeradas
5. **Pie de página**: Fecha, versión y sistema

### Símbolos Utilizados

| Símbolo | Significado |
|---------|-------------|
| 📋 | Tabla de contenidos o listado |
| 🚀 | Instalación o inicio |
| ⚙️ | Configuración |
| 🔧 | Herramientas o componentes técnicos |
| 🗄️ | Base de datos |
| 🎨 | Interfaz de usuario o frontend |
| 🔒 | Seguridad |
| ✅ | Completado o recomendado |
| ❌ | Error o no permitido |
| ⚠️ | Advertencia |
| 💡 | Tip o sugerencia |
| 📊 | Estadísticas o métricas |
| 🔍 | Búsqueda o consulta |

### Formato de Código

**Bloques de código**:
- SQL: Consultas y scripts de base de datos
- JavaScript: Código de Backend y Frontend
- Bash/Batch: Scripts de instalación

**Comandos de terminal**:
```bash
npm install
npm run s
```

**Variables de entorno**:
```env
DB_HOST=localhost
JWT_SECRET=tu_secret
```

---

## 🔄 Mantenimiento de la Documentación

### Versionamiento

Esta documentación corresponde a la **versión 1.0** del sistema.

**Historial de versiones**:
- v1.0 (Enero 2026): Documentación inicial completa

### Actualización

Cuando se realicen cambios en el sistema, actualizar la documentación correspondiente:

| Cambio en el Sistema | Documentos a Actualizar |
|---------------------|-------------------------|
| Nuevo requisito funcional | 01, 04 |
| Nueva tecnología/framework | 03, 07 |
| Cambio en BD | 05, 06 |
| Nuevo módulo | 01, 04, 07 |
| Cambio en instalación | 02, 06 |

---

## 📞 Contacto y Soporte

Para consultas sobre esta documentación:

- **Proyecto**: Sistema de Facturación Electrónica PFEPS
- **Repositorio**: [URL del repositorio]
- **Fecha de creación**: Enero 2026

---

## 📄 Licencia

Esta documentación es parte del Sistema de Facturación Electrónica PFEPS.

---

## 🎯 Roadmap de Documentación Futura

### Documentación Adicional Planeada

- [ ] Manual de Usuario Final
- [ ] Guía de Deployment en Producción
- [ ] Documentación de API (Swagger/OpenAPI)
- [ ] Guía de Contribución
- [ ] Changelog detallado
- [ ] Guía de Troubleshooting Avanzado
- [ ] Diagramas UML adicionales (Secuencia, Actividad)
- [ ] Documentación de Performance y Optimización

---

**Última actualización**: Enero 2026  
**Versión de la documentación**: 1.0  
**Sistema**: Facturación Electrónica PFEPS
