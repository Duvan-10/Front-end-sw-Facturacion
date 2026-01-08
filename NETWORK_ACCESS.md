# 🌐 Guía de Acceso desde Cualquier Dispositivo

Esta guía explica cómo acceder al sistema de facturación desde otros dispositivos en tu red local.

## 📋 Requisitos Previos

1. **Todos los dispositivos deben estar en la misma red WiFi/LAN**
2. **El firewall debe permitir las conexiones** (Windows/Linux/macOS)
3. **Backend y Frontend corriendo** en el dispositivo servidor

---

## 🚀 Configuración del Servidor (Computadora Principal)

### 1. Iniciar Backend

```bash
npm run s
```

**Verás algo como:**
```
🚀 SERVIDOR ACTIVO EN PUERTO: 8080
🌐 Accesible desde cualquier dispositivo en la red
📍 Local: http://localhost:8080
📱 Red: http://192.168.1.100:8080
```

**Anota la IP de red** (ej: `192.168.1.100`)

### 2. Iniciar Frontend

```bash
npm run f
```

**Verás algo como:**
```
VITE v7.2.6  ready in 649 ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.100:5173/
```

**Anota ambas URLs**

---

## 📱 Acceso desde Otros Dispositivos

### Desde Smartphone, Tablet u Otra PC

**Abre el navegador y accede a:**
```
http://192.168.1.100:5173
```

*Reemplaza `192.168.1.100` con la IP de tu computadora servidor*

### Verificar Conexión al Backend

Para confirmar que el backend es accesible:
```
http://192.168.1.100:8080
```

Deberías ver:
```json
{
  "message": "API de Facturación funcionando! 🚀"
}
```

---

## 🔍 Cómo Encontrar tu IP

### Windows
```powershell
ipconfig
```
Busca "IPv4 Address" en la sección de tu adaptador de red activo.

### macOS/Linux
```bash
ifconfig
# o
ip addr show
```
Busca la IP que comience con `192.168.` o `10.`

### Desde Node.js (automático)
El backend ya muestra la IP al iniciar. Solo copia la que dice "Red:".

---

## 🛡️ Configuración del Firewall

### Windows

1. **Abrir Firewall de Windows Defender**
2. **Configuración avanzada > Reglas de entrada**
3. **Nueva regla > Puerto**
4. **Agregar puertos: 8080, 5173**
5. **Permitir la conexión**

**O desde PowerShell (como administrador):**
```powershell
New-NetFirewallRule -DisplayName "Backend Facturacion" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Frontend Facturacion" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow
```

### macOS
```bash
# Normalmente no requiere configuración adicional
# Si tienes firewall activado:
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add node
```

### Linux (UFW)
```bash
sudo ufw allow 8080/tcp
sudo ufw allow 5173/tcp
sudo ufw reload
```

---

## 🔧 Solución de Problemas

### ❌ No puedo acceder desde otro dispositivo

**1. Verifica que ambos estén en la misma red**
```bash
# Desde el dispositivo cliente, haz ping al servidor
ping 192.168.1.100
```

**2. Verifica que los puertos estén escuchando**
```bash
# En el servidor
netstat -an | findstr "8080"
netstat -an | findstr "5173"
```

**3. Desactiva temporalmente el firewall para probar**
- Si funciona sin firewall, el problema es la configuración de puertos

**4. Verifica la configuración de Vite**
- Debe tener `host: true` en vite.config.js ✅ (ya configurado)

**5. Verifica la configuración del Backend**
- Debe escuchar en `0.0.0.0` ✅ (ya configurado)

### ❌ Frontend carga pero no conecta con Backend

**Verifica que api.js use la IP correcta:**

El archivo `Front-End/src/api.js` usa automáticamente:
```javascript
window.location.hostname
```

Esto significa que si accedes con `http://192.168.1.100:5173`, el frontend buscará el backend en `http://192.168.1.100:8080/api` automáticamente.

**Si no funciona, puedes forzar la IP:**

Crea `.env` en `Front-End/`:
```env
VITE_API_URL=http://192.168.1.100:8080/api
```

Reinicia el frontend:
```bash
npm run f
```

---

## 📡 Acceso desde Internet (Avanzado)

Si quieres acceder desde **fuera de tu red local** (Internet):

### Opción 1: Port Forwarding en Router
1. Accede a tu router (ej: 192.168.1.1)
2. Busca "Port Forwarding" o "NAT"
3. Redirige puerto externo 8080 → interno 8080
4. Redirige puerto externo 5173 → interno 5173
5. Usa tu IP pública: `http://TU_IP_PUBLICA:5173`

**Encuentra tu IP pública:**
```bash
curl ifconfig.me
```

### Opción 2: Ngrok (Recomendado para desarrollo)
```bash
# Instalar ngrok
npm install -g ngrok

# Exponer backend
ngrok http 8080

# Exponer frontend (en otra terminal)
ngrok http 5173
```

### Opción 3: Desplegar en Cloud
- Backend: Heroku, Railway, Render, DigitalOcean
- Frontend: Vercel, Netlify, GitHub Pages
- Base de datos: Railway, PlanetScale, AWS RDS

---

## 🔒 Seguridad

**⚠️ IMPORTANTE para producción:**

1. **Nunca expongas el backend sin HTTPS**
2. **Usa variables de entorno para credenciales**
3. **Implementa rate limiting**
4. **Habilita CORS selectivo:**

```javascript
// Backend/server.js
app.use(cors({
  origin: ['http://192.168.1.100:5173', 'http://localhost:5173'],
  credentials: true
}));
```

5. **Cambia JWT_SECRET por uno seguro**
6. **Usa HTTPS con certificados SSL (Let's Encrypt)**

---

## 📝 Checklist de Acceso Remoto

- [ ] Backend corriendo con IP de red visible
- [ ] Frontend corriendo con IP de red visible
- [ ] Ambos dispositivos en la misma red WiFi
- [ ] Firewall configurado (puertos 8080 y 5173 permitidos)
- [ ] Puedes hacer ping entre dispositivos
- [ ] API_URL detecta automáticamente el hostname
- [ ] Probado acceso desde navegador móvil

---

## 🎯 URLs Rápidas

**Desde el mismo equipo:**
- Frontend: http://localhost:5173
- Backend: http://localhost:8080

**Desde otros dispositivos (red local):**
- Frontend: http://TU_IP:5173
- Backend: http://TU_IP:8080

**Para desarrollo externo:**
- Usa ngrok o similar para túneles temporales

---

**¿Problemas?** Revisa la sección de Solución de Problemas arriba. 🔧
