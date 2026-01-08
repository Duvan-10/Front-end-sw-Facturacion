# 🧪 Guía de Prueba - Autenticación Actualizada

## Requisitos Previos

1. **Backend**: Debe estar corriendo en `http://localhost:8080`
2. **Base de datos**: Debe estar accesible
3. **Frontend**: Debe estar corriendo (Vite)

---

## 📋 Casos de Prueba

### ✅ Test 1: Sistema sin usuarios (Primera vez)

**Pasos**:
1. Asegúrate de que la tabla `users` en la BD está vacía
2. Detén y reinicia el backend
3. Abre la app en el navegador (ej: `http://localhost:5173`)
4. Abre la consola del navegador (F12)

**Resultado esperado**:
```
✅ En la consola veo: "📡 Conectando a la API en: http://localhost:8080"
✅ La pantalla muestra "Cargando sistema..." brevemente
✅ Se redirige automáticamente a la página de Bienvenida (WelcomePage)
✅ Botón "Registrarse" es visible
```

---

### ✅ Test 2: Registrar el primer usuario

**Pasos**:
1. Desde la página de Bienvenida, haz clic en "Registrarse"
2. Completa el formulario con los datos del administrador:
   - Cédula: `1234567890`
   - Nombre: `Admin Test`
   - Email: `admin@test.com`
   - Contraseña: `Password123!`
   - Confirmar: `Password123!`
3. Haz clic en "Registrar"

**Resultado esperado**:
```
✅ Se muestra mensaje de éxito: "¡Registro Exitoso! Redirigiendo..."
✅ Después de 2 segundos, se redirige a la pantalla de Login
✅ En la BD aparece el nuevo usuario en la tabla `users`
```

---

### ✅ Test 3: Sistema con usuarios (Login requerido)

**Pasos**:
1. Una vez registrado, abre una nueva pestaña en incógnito/privada
2. Navega a `http://localhost:5173`
3. Abre la consola del navegador

**Resultado esperado**:
```
✅ En la consola veo: "📡 Conectando a la API en: http://localhost:8080"
✅ La pantalla muestra "Cargando sistema..." brevemente
✅ Se redirige automáticamente a /login
✅ Ves la página de Login, NO la página de Bienvenida
```

---

### ✅ Test 4: Intentar acceder a /register cuando hay usuarios

**Pasos**:
1. Con usuarios ya creados en el sistema
2. Escribe en la barra de dirección: `http://localhost:5173/register`
3. Presiona Enter

**Resultado esperado**:
```
✅ La URL intenta cargar /register
✅ La consola muestra "Cargando sistema..."
✅ Se redirige automáticamente a /login
✅ NO se muestra el formulario de registro
```

---

### ✅ Test 5: Login exitoso

**Pasos**:
1. En la página de Login, ingresa las credenciales del usuario creado:
   - Email: `admin@test.com`
   - Contraseña: `Password123!`
2. Haz clic en "Iniciar Sesión"

**Resultado esperado**:
```
✅ Se muestra mensaje de éxito: "Inicio de sesión exitoso"
✅ El token se guarda en sessionStorage
✅ Se redirige a /home
✅ La sesión persiste mientras la pestaña esté abierta
```

---

### ✅ Test 6: Logout

**Pasos**:
1. Una vez logueado en /home
2. Busca el botón de Logout (generalmente en el menú o perfil)
3. Haz clic en él

**Resultado esperado**:
```
✅ Se muestra mensaje: "Sesión cerrada correctamente"
✅ El token se elimina de sessionStorage
✅ Se redirige a /login
✅ Puedes volver a iniciar sesión
```

---

## 🔍 Verificación en la Consola del Navegador

### Logs esperados al cargar la app:

```javascript
// 1. Verificación del sistema
"📡 Conectando a la API en: http://localhost:8080"

// 2. Respuesta del servidor (sin usuarios)
// En Network → Verifica la request a /api/auth/has-users
// Response: { "hasUsers": false }

// 3. Respuesta del servidor (con usuarios)
// Response: { "hasUsers": true }
```

### Verificación de sessionStorage:

En la consola del navegador, ejecuta:
```javascript
// Ver el token
sessionStorage.getItem('token')
// Debería retornar un string largo (JWT) si está logueado

// Ver datos del usuario
JSON.parse(sessionStorage.getItem('user'))
// Debería retornar un objeto con los datos del usuario
```

---

## 🛑 Problemas Comunes

| Problema | Solución |
|----------|----------|
| "Error verificando sistema" | Verifica que el backend esté corriendo en `http://localhost:8080` |
| La app queda en "Cargando sistema..." | Revisa Network → `/api/auth/has-users` está fallando |
| No se redirige a WelcomePage | Verifica que la tabla `users` esté vacía en la BD |
| /register no funciona | Asegúrate que el backend respondió `hasUsers: false` |

---

## 📊 Estados de la Aplicación

```
┌─────────────────────────────────────────┐
│         ESTADO DE LA APLICACIÓN         │
├─────────────────────────────────────────┤
│                                         │
│  Sin usuarios en BD                     │
│  └─→ WelcomePage                        │
│      └─→ /register (permitido)          │
│          └─→ /login (después de crear)  │
│                                         │
│  Con usuarios en BD                     │
│  └─→ /login (automático)                │
│      └─→ /register (bloqueado)          │
│      └─→ /home (con token válido)       │
│                                         │
└─────────────────────────────────────────┘
```

---

**✅ Si todos los tests pasan, la autenticación está correctamente configurada.**

Última actualización: 8 de enero de 2026
