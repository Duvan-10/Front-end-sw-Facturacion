# 🧾 Sistema de Facturación Electrónica - PFEPS

Sistema completo de facturación electrónica con gestión de clientes, productos, facturas y usuarios.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [Scripts Disponibles](#scripts-disponibles)

## ✨ Características

### Autenticación y Usuarios
- ✅ Registro del primer usuario como administrador
- ✅ Sistema de login con JWT
- ✅ Gestión de usuarios con roles (Admin, Usuario, Empleado)
- ✅ Solo el administrador puede crear nuevos usuarios

### Módulos Principales
- 📋 **Facturas**: Crear, editar, listar y generar PDF
- 👥 **Clientes**: Gestión completa de clientes
- 📦 **Productos**: Catálogo de productos
- 📊 **Reportes**: Análisis y reportes
- 👤 **Perfil**: Gestión del perfil de usuario
- 🔐 **Usuarios**: Administración de usuarios (solo admin)

### Características Adicionales
- 🌓 Modo claro/oscuro
- 📱 Diseño responsive
- 🔒 Rutas protegidas
- 💾 Persistencia de sesión

## 🛠 Tecnologías

**Frontend:** React 19.2 + Vite 7.2 + React Router 7.10  
**Backend:** Node.js + Express 5.2 + MySQL  
**Auth:** JWT + bcryptjs  
**Testing:** Playwright

## 📁 Estructura del Proyecto

```
Front-end-sw-Facturacion/
├── Backend/              # API Node.js
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
├── Front-End/            # React App
│   ├── src/
│   │   ├── Auth/
│   │   ├── components/
│   │   ├── context/
│   │   ├── modules/
│   │   └── App.jsx
│   └── vite.config.js
└── package.json
```

## 📦 Requisitos Previos

- Node.js >= 18.x
- MySQL >= 8.0
- npm >= 9.x

## 🚀 Instalación

```bash
# Clonar repositorio
git clone <url>
cd Front-end-sw-Facturacion

# Instalar dependencias
npm install

# Crear base de datos
mysql -u root -p
CREATE DATABASE facturacion_db;
```

## ⚙️ Configuración

**Backend/.env:**
```env
PORT=8080
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=facturacion_db
JWT_SECRET=tu_clave_secreta
```

**Front-End/.env:**
```env
VITE_API_URL=http://localhost:8080/api
```

## 🎯 Uso

```bash
# Backend (puerto 8080)
npm run s

# Frontend (puerto 5173)
npm run f
```

### Acceso Local
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`

### Acceso desde Otros Dispositivos (misma red WiFi)

El servidor mostrará la IP al iniciar:
```
📱 Red: http://192.168.1.100:5173
```

**Desde cualquier dispositivo en la misma red:**
- Abre el navegador
- Accede a `http://TU_IP:5173`

📖 **Ver guía completa:** [NETWORK_ACCESS.md](NETWORK_ACCESS.md)

### Primer Uso

1. Abre `http://localhost:5173`
2. Verás WelcomePage (primera vez)
3. Click "Registrarse" → Crea primer admin
4. Inicia sesión
5. Accede a módulo "Usuarios" para crear más usuarios

## 📜 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run s` | Backend con nodemon |
| `npm run f` | Frontend con Vite |
| `npm run build` | Build producción |
| `npm run test:e2e` | Tests Playwright |

## 🔌 API Endpoints

**Auth:**
- `GET /api/auth/has-users` - Verifica usuarios
- `POST /api/auth/register` - Registro inicial
- `POST /api/auth/login` - Login

**Usuarios (admin):**
- `GET /api/users` - Lista usuarios
- `POST /api/users` - Crea usuario

**Clientes/Productos/Facturas:**
- `GET/POST/PUT/DELETE /api/{resource}`

## 🔐 Roles

- **Admin**: Acceso total + gestión de usuarios
- **Empleado**: CRUD clientes/productos/facturas
- **Usuario**: Solo lectura

## 📝 Notas

- Token JWT expira en 7 días
- Sesiones en sessionStorage
- Primer usuario = admin automático
- CORS habilitado por defecto

---
**Desarrollado con ❤️ para facilitar la facturación electrónica**
