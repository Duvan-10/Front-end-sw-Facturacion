# API Documentation

## Base URL
```
http://localhost:8080/api
```

## Authentication

Todos los endpoints (excepto auth) requieren header:
```
Authorization: Bearer <token>
```

---

## 🔐 Auth Endpoints

### Verificar si existen usuarios
```http
GET /auth/has-users
```

**Response:**
```json
{
  "hasUsers": false
}
```

---

### Registro (solo primera vez)
```http
POST /auth/register
```

**Body:**
```json
{
  "name": "Admin User",
  "identification": "1234567890",
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "message": "Usuario administrador registrado con éxito",
  "userId": 1,
  "role": "admin"
}
```

**Error (403) - Ya existen usuarios:**
```json
{
  "message": "El registro está deshabilitado. Solo el administrador puede crear nuevos usuarios."
}
```

---

### Login
```http
POST /auth/login
```

**Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "identification": "1234567890",
    "role": "admin"
  }
}
```

---

## 👥 Users Endpoints (Admin only)

### Listar usuarios
```http
GET /users
Authorization: Bearer <admin-token>
```

**Response (200):**
```json
{
  "message": "Usuarios obtenidos exitosamente",
  "count": 3,
  "users": [
    {
      "id": 1,
      "name": "Admin User",
      "identification": "1234567890",
      "email": "admin@example.com",
      "role": "admin",
      "created_at": "2026-01-08T10:00:00.000Z"
    }
  ]
}
```

---

### Crear usuario
```http
POST /users
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Nuevo Usuario",
  "identification": "0987654321",
  "email": "usuario@example.com",
  "password": "password123",
  "role": "user"
}
```

**Roles válidos:** `admin`, `user`, `empleado`

**Response (201):**
```json
{
  "message": "Usuario creado exitosamente",
  "userId": 2,
  "user": {
    "id": 2,
    "name": "Nuevo Usuario",
    "email": "usuario@example.com",
    "identification": "0987654321",
    "role": "user"
  }
}
```

---

## 👤 Clientes Endpoints

### Listar clientes
```http
GET /clientes
Authorization: Bearer <token>
```

### Crear cliente
```http
POST /clientes
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Cliente Ejemplo",
  "identification": "1234567890",
  "email": "cliente@example.com",
  "phone": "+57 300 1234567",
  "address": "Calle 123 #45-67"
}
```

### Obtener cliente
```http
GET /clientes/:id
Authorization: Bearer <token>
```

### Actualizar cliente
```http
PUT /clientes/:id
Authorization: Bearer <token>
Content-Type: application/json
```

### Eliminar cliente
```http
DELETE /clientes/:id
Authorization: Bearer <token>
```

---

## 📦 Productos Endpoints

### Listar productos
```http
GET /productos
Authorization: Bearer <token>
```

### Crear producto
```http
POST /productos
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "code": "PROD001",
  "name": "Producto Ejemplo",
  "description": "Descripción del producto",
  "price": 100000,
  "stock": 50,
  "category": "Categoría"
}
```

### Obtener producto
```http
GET /productos/:id
Authorization: Bearer <token>
```

### Actualizar producto
```http
PUT /productos/:id
Authorization: Bearer <token>
```

### Eliminar producto
```http
DELETE /productos/:id
Authorization: Bearer <token>
```

---

## 📋 Facturas Endpoints

### Listar facturas
```http
GET /facturas
Authorization: Bearer <token>
```

### Crear factura
```http
POST /facturas
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "client_id": 1,
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "price": 100000
    }
  ],
  "subtotal": 200000,
  "tax": 38000,
  "total": 238000,
  "notes": "Notas adicionales"
}
```

### Obtener factura
```http
GET /facturas/:id
Authorization: Bearer <token>
```

### Actualizar factura
```http
PUT /facturas/:id
Authorization: Bearer <token>
```

### Eliminar factura
```http
DELETE /facturas/:id
Authorization: Bearer <token>
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "message": "Acceso denegado. No se proporcionó token."
}
```

### 403 Forbidden
```json
{
  "message": "Acceso denegado. Solo los administradores pueden crear usuarios."
}
```

### 404 Not Found
```json
{
  "message": "Recurso no encontrado"
}
```

### 409 Conflict
```json
{
  "message": "La identificación (Cédula) ya está registrada."
}
```

### 500 Internal Server Error
```json
{
  "message": "Error interno del servidor."
}
```

---

## Notes

- **Token expira en 7 días**
- **Todos los timestamps en formato ISO 8601**
- **Moneda en centavos (100000 = $100.000 COP)**
