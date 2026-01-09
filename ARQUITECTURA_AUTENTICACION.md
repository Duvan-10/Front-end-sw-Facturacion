# 🏗️ Arquitectura Técnica - Sistema de Autenticación

## 📐 Diagrama de Flujo

```
┌────────────────────────────────────────────────────────────┐
│                    USUARIO ABRE LA APP                     │
│                  (navega a /)                               │
└───────────────────────┬────────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │      App.jsx carga            │
        │   useEffect ejecuta:          │
        │  fetch(/api/auth/has-users)   │
        └───────────────┬───────────────┘
                        │
                ┌───────┴────────┐
                │                │
         (hasUsers=null)   (fetching...)
                │                │
                └────────┬───────┘
                         │
            ┌────────────┴────────────┐
            │                         │
        ✅ RESPUESTA                  ❌ ERROR
        ┌─────────────────┐      ┌──────────────┐
        │                 │      │ Asumir       │
        │ hasUsers=true   │      │ hasUsers=false
        │ o               │      └──────┬───────┘
        │ hasUsers=false  │             │
        └────────┬────────┘             │
                 │          ┌───────────┘
                 │          │
        ┌────────┴──────────┴─────────┐
        │                              │
   hasUsers=true                 hasUsers=false
        │                              │
        ▼                              ▼
   RootGuard: true              RootGuard: false
        │                              │
   Navigate to:                   Navigate to:
    /login                        / (WelcomePage)
        │                              │
        ▼                              ▼
   LOGIN SCREEN                  WELCOME PAGE
        │                              │
        │◄─────────────────────────────┘
        │         (Botón Registrarse)
        │
    ┌───┴────────────┐
    │                │
Tiene               No tiene
credenciales        credenciales
    │                │
    ▼                ▼
POST /login        GET /register
    │           (RegisterGuard)
    │                │
    ├─────(hasUsers=false)─────┐
    │                           │
    ▼                           ▼
Token +             REGISTER FORM
User Data               │
    │                   │
    │              POST /register
    │                   │
    │                   ▼
    │           Usuario Creado
    │                   │
    └─────────────────▶│
                       │
                       ▼
                sessionStorage:
                • token
                • user
                       │
                       ▼
                  Navigate /home
                       │
                       ▼
                 ProtectedRoute
                       │
                       ▼
                   HOME SCREEN
                     (Privada)
```

---

## 🔐 Componentes de Seguridad

### 1. **RootGuard** (Front-End)
```javascript
// Ubicación: App.jsx
// Responsabilidad: Validar estado del sistema al raíz

const RootGuard = ({ hasUsers }) => {
    if (hasUsers === null) return <Loading />
    return hasUsers ? <Navigate to="/login" /> : <WelcomePage />
}
```

**Flujo**:
- Se ejecuta en la ruta `/`
- Llama a `GET /api/auth/has-users` (via useEffect en App.jsx)
- Redirige según el resultado

---

### 2. **RegisterGuard** (Front-End)
```javascript
// Ubicación: App.jsx
// Responsabilidad: Proteger acceso a /register

const RegisterGuard = ({ hasUsers, children }) => {
    if (hasUsers === null) return <Loading />
    if (hasUsers) return <Navigate to="/login" />
    return children
}
```

**Flujo**:
- Se ejecuta en la ruta `/register`
- Bloquea acceso si `hasUsers === true`
- Permite acceso solo si `hasUsers === false`

---

### 3. **ProtectedRoute** (Front-End)
```javascript
// Ubicación: ProtectedRoute.jsx
// Responsabilidad: Proteger rutas privadas

const ProtectedRoute = () => {
    const { user } = useAuth()
    return user ? <Outlet /> : <Navigate to="/login" />
}
```

**Flujo**:
- Se ejecuta en rutas privadas (/home, /clientes, etc.)
- Verifica si existe `user` en AuthContext
- Redirige a login si no está autenticado

---

## 📡 Endpoints Backend

### GET `/api/auth/has-users`
```
Responsabilidad: Verificar si existen usuarios registrados

Request:
  - Método: GET
  - Headers: (ninguno especial)
  - Body: (vacío)

Response (200):
  {
    "hasUsers": boolean
  }

Response (500):
  {
    "message": "Error interno del servidor"
  }

Implementación:
  - controllers/auth.controller.js → checkHasUsers()
  - models/user.model.js → hasUsers()
```

---

### POST `/api/auth/register`
```
Responsabilidad: Crear el primer usuario (admin)

Request:
  {
    "name": "string",
    "identification": "string (cédula)",
    "email": "string",
    "password": "string"
  }

Response (201):
  {
    "message": "Usuario administrador registrado con éxito",
    "userId": "uuid",
    "role": "admin"
  }

Response (403):
  {
    "message": "El registro está deshabilitado..."
  }

Response (409):
  {
    "message": "La identificación ya está registrada"
  }

Lógica:
  1. Verifica hasUsers() → si true, rechaza
  2. Valida que cédula no exista
  3. Valida que email no exista
  4. Crea usuario con role "admin"
```

---

### POST `/api/auth/login`
```
Responsabilidad: Autenticar usuario

Request:
  {
    "email": "string",
    "password": "string"
  }

Response (200):
  {
    "message": "Login exitoso",
    "token": "JWT_TOKEN_HERE",
    "user": {
      "id": "uuid",
      "name": "string",
      "email": "string",
      "identification": "string",
      "role": "admin"
    }
  }

Response (401):
  {
    "message": "Credenciales inválidas..."
  }

Lógica:
  1. Busca usuario por email
  2. Verifica contraseña con bcrypt
  3. Genera JWT con expiración de 7 días
```

---

## 🔄 Flujos de Estado

### Flujo 1: Primera carga sin usuarios

```javascript
App carga
  ↓
useEffect ejecuta
  ↓
fetch(/api/auth/has-users)
  ↓
Response: { hasUsers: false }
  ↓
setHasUsers(false)
  ↓
RootGuard renderiza WelcomePage
  ↓
Usuario ve Welcome Page
```

### Flujo 2: Primera carga con usuarios

```javascript
App carga
  ↓
useEffect ejecuta
  ↓
fetch(/api/auth/has-users)
  ↓
Response: { hasUsers: true }
  ↓
setHasUsers(true)
  ↓
RootGuard redirige a /login
  ↓
Usuario ve Login Screen
```

### Flujo 3: Acceso a /register sin usuarios

```javascript
Usuario navega a /register
  ↓
RegisterGuard evalúa hasUsers
  ↓
hasUsers === false
  ↓
RegisterGuard retorna <Register />
  ↓
Usuario ve Register Form
```

### Flujo 4: Acceso a /register con usuarios

```javascript
Usuario intenta navegar a /register
  ↓
RegisterGuard evalúa hasUsers
  ↓
hasUsers === true
  ↓
RegisterGuard ejecuta <Navigate to="/login" />
  ↓
Usuario redirigido a /login
```

---

## 🎯 Variables de Estado Clave

| Variable | Ubicación | Tipo | Propósito |
|----------|-----------|------|----------|
| `hasUsers` | App.jsx | boolean \| null | Indica si existen usuarios en la BD |
| `user` | AuthContext | object \| null | Datos del usuario logueado |
| `token` | AuthContext + sessionStorage | string \| null | Token JWT para autenticación |
| `isAuthenticated` | AuthContext | boolean | `!!user` para acceso rápido |

---

## 📦 Dependencias

### Front-End
- `react`: Framework UI
- `react-router-dom`: Sistema de rutas (Navigate, useNavigate, Routes, Route)
- `fetch API`: Llamadas HTTP (nativa del navegador)

### Back-End
- `express`: Servidor web
- `jsonwebtoken`: Generación de JWT
- `bcryptjs`: Hash de contraseñas
- `cors`: Manejo de CORS
- Base de datos SQL (queries en models/user.model.js)

---

## ⚡ Optimizaciones Futuras

### 1. Caché del estado de usuarios
```javascript
// Guardar hasUsers en localStorage durante cierto tiempo
const getCachedUsersState = () => {
    const cached = localStorage.getItem('system_has_users');
    if (cached) return JSON.parse(cached);
    return null;
};

// Actualizar caché cuando se registra nuevo usuario
const updateUsersCache = (value) => {
    localStorage.setItem('system_has_users', JSON.stringify(value));
};
```

### 2. Polling periódico
```javascript
// Actualizar estado de usuarios cada 30 segundos
const interval = setInterval(() => {
    checkSystem();
}, 30000);
```

### 3. Contexto global para hasUsers
```javascript
// Crear SystemContext para compartir hasUsers en toda la app
export const SystemContext = React.createContext(null);
```

---

## 🔒 Seguridad Implementada

✅ **JWT con expiración de 7 días**
✅ **Contraseñas hasheadas con bcryptjs**
✅ **sessionStorage para datos sensibles (no localStorage)**
✅ **Validación en servidor (no confiar en cliente)**
✅ **Restricción de registro a primer usuario**
✅ **CORS configurado en servidor**

---

**Documentación técnica actualizada: 8 de enero de 2026**
