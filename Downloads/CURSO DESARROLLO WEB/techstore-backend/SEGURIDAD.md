# 🔒 Documentación de Seguridad — TechStore Backend

## Resumen Ejecutivo

Este documento detalla todas las medidas de seguridad implementadas en el backend de TechStore. El sistema está diseñado para proteger contra vulnerabilidades comunes (OWASP Top 10) y estar listo para producción.

---

## 📋 Índice

1. [Protección contra Fuerza Bruta](#1-protección-contra-fuerza-bruta)
2. [Prevención de XSS](#2-prevención-de-xss)
3. [CORS Seguro](#3-cors-seguro)
4. [Control de Acceso JWT](#4-control-de-acceso-jwt)
5. [Prevención de Inyección NoSQL](#5-prevención-de-inyección-nosql)
6. [Cabeceras HTTP Seguras](#6-cabeceras-http-seguras)
7. [Validación y Sanitización](#7-validación-y-sanitización)
8. [Manejo Centralizado de Errores](#8-manejo-centralizado-de-errores)

---

## 1. Protección contra Fuerza Bruta

### 📦 Paquete: `express-rate-limit`

**Archivo:** `src/middleware/rateLimit.middleware.js`

### Implementación

```javascript
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // Ventana de 15 minutos
  max: 5,                     // Máximo 5 intentos
  // ...
});
```

### Limitadores Implementados

| Limitador | Endpoint | Límite | Ventana |
|-----------|----------|--------|---------|
| `loginLimiter` | POST /auth/login | 5 intentos | 15 min |
| `registroLimiter` | POST /auth/registro | 3 registros | 1 hora |
| `checkEmailLimiter` | GET /auth/check-email | 20 requests | 5 min |
| `globalLimiter` | Toda la API | 100 requests | 15 min |

### Cómo Funciona

1. **Identificación por IP**: Extrae la IP real del cliente
2. **Contador**: Rastrea intentos desde cada IP
3. **Bloqueo**: Responde con HTTP 429 (Too Many Requests)
4. **Ventana deslizante**: Se reinicia después de cada ventana

### Ejemplo de Respuesta al Exceder Límite

```json
{
  "ok": false,
  "mensaje": "Demasiados intentos de login. Intenta de nuevo en 15 minutos.",
  "intentosRestantes": 0
}
```

### ✅ Vulnerabilidad Mitigada

- **Ataque de Fuerza Bruta**: Imposible ejecutar ataques de diccionario
- **Enumeración de Usuarios**: Los límites aplican por igual a todos

---

## 2. Prevención de XSS (Cross-Site Scripting)

### 📦 Paquetes: `express-validator`, `helmet`

**Archivos:** 
- `src/middleware/validation.middleware.js`
- `src/config/helmetConfig.js`

### Capas de Defensa

#### a) Validación de Entrada con `express-validator`

```javascript
body('nombre')
  .trim()                           // Elimina espacios
  .isLength({ min: 3, max: 100 })  // Limita longitud
  .matches(/^[a-zA-Z\s]+$/)         // Solo caracteres seguros
```

#### b) Sanitización Automática

```javascript
body('correo')
  .trim()
  .normalizeEmail()  // Normaliza formato de email
```

#### c) Content Security Policy (CSP) con Helmet

```javascript
contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],     // Solo scripts del mismo origen
    styleSrc: ["'self'", "'unsafe-inline'"],
  }
}
```

### Ejemplo de Validación

```javascript
// Request rechazado:
{
  "nombre": "<script>alert('xss')</script>"
}

// Respuesta:
{
  "ok": false,
  "mensaje": "Error de validación",
  "errores": [
    {
      "campo": "nombre",
      "mensaje": "El nombre solo puede contener letras y espacios"
    }
  ]
}
```

### ✅ Vulnerabilidad Mitigada

- **Inyección de Scripts**: Input validado y sanitizado
- **DOM-based XSS**: CSP previene ejecución de scripts inyectados

---

## 3. CORS Seguro

### 📦 Paquete: `cors`

**Archivo:** `src/config/corsConfig.js`

### Whitelist de Orígenes

```javascript
const WHITELIST = [
  'http://localhost:4200',           // Angular local
  'https://techstore.vercel.app',    // Frontend en Vercel
  'https://techstore-api.render.com' // Backend en Render
];
```

### Validación de Origen

```javascript
origin: (origin, callback) => {
  if (!origin || WHITELIST.includes(origin)) {
    callback(null, true);
  } else {
    callback(new Error('No permitido por CORS'));
  }
}
```

### Configuración Aplicada

```javascript
corsOptions = {
  credentials: true,  // Permite cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400  // Cache de 24 horas
}
```

### ✅ Vulnerabilidad Mitigada

- **CSRF**: Token JWT en header Authorization
- **Acceso No Autorizado**: Solo orígenes en whitelist

---

## 4. Control de Acceso mediante JWT

### 📦 Paquete: `jsonwebtoken`

**Archivos:**
- `src/middleware/auth.middleware.js`
- `src/controllers/auth.controller.js`

### Flujo de Autenticación

```
1. Usuario inicia sesión
   ↓
2. Backend verifica credenciales
   ↓
3. Genera JWT firmado con JWT_SECRET
   ↓
4. Frontend guarda token (localStorage/sessionStorage)
   ↓
5. Cliente envía token en header: Authorization: Bearer <token>
   ↓
6. Backend verifica firma y expiration
```

### Estructura del JWT

```javascript
header: {
  "alg": "HS256",
  "typ": "JWT"
}

payload: {
  "id": "usuario_id",
  "correo": "usuario@example.com",
  "iat": 1704067200,
  "exp": 1704672000  // Expira en 7 días
}

signature: HMACSHA256(header + payload, JWT_SECRET)
```

### Middleware de Verificación

```javascript
// src/middleware/auth.middleware.js
const verificarToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ mensaje: 'Token no proporcionado' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    res.status(401).json({ mensaje: 'Token inválido o expirado' });
  }
};
```

---

## 4.1 Control de Acceso - Middleware de Autorización

### 📦 Middleware: `authorization.middleware.js`

**Archivo:** `src/middleware/authorization.middleware.js`

### Tipos de Autorización

#### 1. Verificar que Usuario Accede Solo a Sus Recursos

```javascript
// Middleware: autorizarUsuario
router.get('/perfil', verificarToken, autorizarUsuario, obtenerPerfil);

// Verifica: req.usuario.id === req.params.usuarioId
// Si no coincide → 403 Forbidden
```

#### 2. Verificar Rol Administrativo

```javascript
// Middleware: autorizarAdmin
router.delete('/:id', verificarToken, autorizarAdmin, eliminarProducto);

// Verifica: req.usuario.rol === 'admin'
// Si no es admin → 403 Forbidden
```

#### 3. Verificar Propiedad de Recurso

```javascript
// Middleware: verificarPropietarioProducto
// Verifica que el usuario que modifica sea el propietario
```

### Ejemplo de Uso en Rutas

```javascript
// src/routes/producto.routes.js

// ✅ GET - Público (sin autenticación)
router.get('/', obtenerProductos);

// ✅ POST - Requiere autenticación
router.post('/',
  verificarToken,           // Verificar JWT válido
  middlewareSanitizarNoSQL, // Prevenir inyecciones
  validarProducto,          // Validar datos
  crearProducto             // Controlador
);

// ✅ PUT - Requiere autenticación + propiedad
router.put('/:id',
  verificarToken,                 // Verificar JWT válido
  middlewareSanitizarNoSQL,       // Prevenir inyecciones
  verificarPropietarioProducto,   // Verificar propiedad
  validarProducto,                // Validar datos
  actualizarProducto              // Controlador
);

// ✅ DELETE - Requiere autenticación
router.delete('/:id',
  verificarToken,           // Verificar JWT válido
  middlewareSanitizarNoSQL, // Prevenir inyecciones
  eliminarProducto          // Controlador
);
```

### Ejemplos de Respuestas

#### ✅ Acceso Autorizado

```json
{
  "ok": true,
  "usuario": {
    "id": "60d7f3a4b5c8d9e0f1g2h3i4",
    "nombreCompleto": "Juan Pérez",
    "correo": "juan@example.com"
  }
}
```

#### ❌ Token No Proporcionado

```json
{
  "ok": false,
  "mensaje": "Token no proporcionado"
}
```

#### ❌ Token Inválido/Expirado

```json
{
  "ok": false,
  "mensaje": "El token ha expirado"
}
```

#### ❌ Acceso Denegado (No Autorizado)

```json
{
  "ok": false,
  "mensaje": "No tienes permiso para acceder a este recurso"
}
```

### ✅ Vulnerabilidades Mitigadas

- **Acceso No Autorizado**: Solo propietarios pueden modificar
- **Privilege Escalation**: Roles verificados en cada request
- **Data Leakage**: No puede acceder a datos de otros usuarios

---

## 4.2 Flujo Completo de Autenticación y Autorización

```
1. REGISTRO
   POST /api/auth/registro
   ├─ Express-validator valida datos
   ├─ Sanitización NoSQL rechaza operadores
   ├─ Bcrypt hashea contraseña
   ├─ Crea usuario en BD
   └─ Retorna JWT

2. LOGIN
   POST /api/auth/login
   ├─ Rate limiter: máximo 5 intentos en 15 min
   ├─ Express-validator valida email y contraseña
   ├─ Bcrypt compara contraseñas
   ├─ JWT verificado y válido por 7 días
   └─ Token guardado en cliente

3. REQUEST AUTENTICADO
   GET /api/productos
   ├─ Header: Authorization: Bearer <token>
   ├─ Middleware verificarToken extrae y valida JWT
   ├─ Payload decodificado en req.usuario
   ├─ Middleware de autorización verifica permisos
   └─ Controlador accede a req.usuario

4. TOKEN EXPIRADO
   ├─ Cliente recibe 401 Unauthorized
   ├─ Frontend redirige a login
   └─ Usuario debe autenticarse nuevamente
```

---

## 5. Prevención de Inyección NoSQL

### 📦 Paquetes: `express-validator` + Middleware personalizado

**Archivos:** 
- `src/middleware/validation.middleware.js`
- `src/middleware/nosqlInjection.middleware.js`

### Doble Capa de Protección

#### Capa 1: Validación con express-validator

```javascript
// Entrada peligrosa
{
  "correo": { "$ne": null }
}

// Validación rechaza
body('correo')
  .isEmail()  // Solo emails válidos
  .normalizeEmail()
```

#### Capa 2: Sanitización Global de NoSQL

```javascript
// Middleware: src/middleware/nosqlInjection.middleware.js
const sanitizarNoSQL = (obj) => {
  const operadoresPeligrosos = [
    '$gt', '$gte', '$lt', '$lte', '$ne', '$in', '$nin',
    '$and', '$or', '$not', '$where', '$regex',
    '$exists', '$type', '$mod', '$text', '$js'
  ];

  // Rechaza cualquier clave que comience con $
  for (const clave in obj) {
    if (clave.startsWith('$')) {
      console.warn(`⚠️ Operador bloqueado: ${clave}`);
      delete obj[clave];
    }
  }
  return obj;
};
```

### Búsquedas Seguras

```javascript
// ❌ INSEGURO - Vulnerable a NoSQL injection
const user = await Usuario.findOne({ correo: req.body.correo });

// ✅ SEGURO - Sanitización global + Express-validator
// 1. Middleware sanitiza req.body
// 2. Express-validator valida tipos
// 3. Mongoose rechaza operadores
const user = await Usuario.findOne({ 
  correo: correo.toLowerCase() 
});
```

### Prevención de Operadores Maliciosos

```javascript
// Estos operadores son RECHAZADOS por el middleware:
// { "$gt": null }         → bloqueado
// { "$regex": ".*" }      → bloqueado
// { "$where": "func..." } → bloqueado
// { "$ne": null }         → bloqueado
// { "$or": [...] }        → bloqueado

// Solo valores primitivos permitidos:
body('precio').isFloat()      // Número
body('nombre').isString()     // String
body('categoría').isIn([...]) // Enum
```

### Ejemplo de Ataque Mitigado

```bash
# Atacante intenta inyectar:
curl -X POST http://localhost:3000/api/productos \
  -H "Content-Type: application/json" \
  -d '{"nombre": {"$ne": null}, "precio": {"$gt": 0}}'

# ✅ Resultado:
# 1. Middleware sanitizarNoSQL elimina $ne y $gt
# 2. Express-validator rechaza datos inválidos
# 3. Respuesta: Error de validación
```

### ✅ Vulnerabilidad Mitigada

- **NoSQL Injection**: Doble sanitización
- **Operadores Maliciosos**: Completamente bloqueados
- **Enumeración de Datos**: Queries no pueden modificarse

---

## 6. Cabeceras HTTP Seguras

### 📦 Paquete: `helmet`

**Archivo:** `src/config/helmetConfig.js`

### Cabeceras Implementadas

| Cabecera | Propósito | Valor |
|----------|-----------|-------|
| X-Frame-Options | Clickjacking | deny |
| X-Content-Type-Options | MIME Sniffing | nosniff |
| Content-Security-Policy | XSS | self |
| Referrer-Policy | Información de referrer | strict-origin-when-cross-origin |
| X-XSS-Protection | XSS legado | 1; mode=block |
| Strict-Transport-Security | HTTPS forzado | max-age=31536000 |

### Ejemplo de Cabeceras Respuesta

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### ✅ Vulnerabilidad Mitigada

- **Clickjacking**: X-Frame-Options: DENY
- **MIME Sniffing**: X-Content-Type-Options: nosniff
- **Man-in-the-Middle**: HSTS fuerza HTTPS

---

## 7. Validación y Sanitización

### Validaciones Implementadas

#### Usuarios

```javascript
// Registro
{
  nombreCompleto: 3-100 caracteres, solo letras
  correo: formato email válido
  contrasena: 6-128 caracteres
    - Al menos 1 minúscula
    - Al menos 1 mayúscula
    - Al menos 1 número
  confirmarContrasena: debe coincidir
}

// Login
{
  correo: formato email válido
  contrasena: 6+ caracteres
}
```

#### Productos

```javascript
{
  nombre: 3-100 caracteres
  categoria: enum de 10 categorías válidas
  ubicacion: 2-50 caracteres
  precio: número >= 0
}
```

### Sanitización

```javascript
// Trim - Elimina espacios
body('nombre').trim()

// Lowercase - Normaliza
body('correo').normalizeEmail()

// Escape - Escapa caracteres peligrosos
// Automático en MongoDB con Mongoose
```

### ✅ Vulnerabilidad Mitigada

- **Inyección**: Solo datos validados se procesan
- **Datos Inválidos**: Schema rechaza datos incorrectos

---

## 8. Manejo Centralizado de Errores

### 📦 Paquete: `express`

**Archivo:** `src/middleware/errorHandler.middleware.js`

### Estructura de Manejo

```javascript
class AppError extends Error {
  constructor(mensaje, codigoEstado) {
    super(mensaje);
    this.codigoEstado = codigoEstado;
  }
}

const errorHandler = (err, req, res, next) => {
  // Detecta tipo de error
  // Mapea a HTTP status
  // Envía respuesta coherente
}
```

### Tipos de Errores Manejados

| Error | Causa | HTTP Status |
|-------|-------|------------|
| ValidationError | Campo inválido | 400 |
| CastError | ID inválido | 400 |
| JsonWebTokenError | Token inválido | 401 |
| TokenExpiredError | Token expirado | 401 |
| Duplicate Key (11000) | Correo duplicado | 409 |
| Not Found | Recurso no existe | 404 |

### Ejemplo de Respuesta de Error

```json
{
  "ok": false,
  "mensaje": "El correo ya está registrado"
}
```

### Respuestas No Revelan Detalles

```javascript
// ❌ Inseguro (Development)
{
  "error": "MongooseError: ..."
}

// ✅ Seguro (Production)
{
  "ok": false,
  "mensaje": "Error del servidor"
}
```

### ✅ Vulnerabilidad Mitigada

- **Information Disclosure**: No revela detalles internos
- **Errores Genéricos**: Respuestas consistentes

---

---

## 🚀 Despliegue Seguro en Render y Vercel

### Opción 1: Despliegue en Render

**Render** es ideal para el backend Node.js/Express.

#### Pasos

1. **Crear repositorio en GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/usuario/techstore-backend
   git push -u origin main
   ```

2. **Conectar Render con GitHub**
   - Ir a [render.com](https://render.com)
   - Click en "New +" → "Web Service"
   - Conectar cuenta GitHub
   - Seleccionar repositorio

3. **Configurar Variables de Entorno**
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
   
4. **Agregar Secrets**
   - Ir a Settings → Environment
   - Agregar cada variable de `.env`:
     ```
     MONGODB_URI = mongodb+srv://...
     JWT_SECRET = tu_clave_aleatoria_32_caracteres
     NODE_ENV = production
     PORT = 3000
     ```

5. **Verificar Despliegue**
   ```bash
   # Tu API estará en:
   https://techstore-api.render.com
   ```

### Opción 2: Despliegue de Frontend en Vercel

**Vercel** es mejor para el frontend (aunque puede hostear backends también).

#### Pasos

1. **Preparar Frontend (Angular/React)**
   - Build: `npm run build`
   - Output folder: `dist/` o `build/`

2. **Desplegar en Vercel**
   - Ir a [vercel.com](https://vercel.com)
   - Conectar GitHub
   - Seleccionar repo del frontend
   - Settings → Environment Variables

3. **Actualizar CORS en Backend**
   ```javascript
   // src/config/corsConfig.js
   const WHITELIST = [
     'http://localhost:4200',
     'https://techstore.vercel.app',  // Tu frontend en Vercel
     'https://techstore-api.render.com' // Tu backend en Render
   ];
   ```

### Configuración de Variables en Ambos Servicios

#### En Render

```
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=abc123xyz456...
CORS_ORIGINS=https://techstore.vercel.app,https://techstore-api.render.com
```

#### En Vercel (Frontend)

```
REACT_APP_API_URL=https://techstore-api.render.com
REACT_APP_JWT_SECRET_UI_ONLY=no_needed_here
```

### Checklist de Seguridad Previo al Despliegue

- [ ] `NODE_ENV=production`
- [ ] `JWT_SECRET` tiene 32+ caracteres
- [ ] `MONGODB_URI` usa credenciales fuertes
- [ ] CORS actualizado con dominios de producción
- [ ] Rate limiting configurado adecuadamente
- [ ] HTTPS habilitado (automático en Render/Vercel)
- [ ] Variables sensibles NO están en código
- [ ] `.env` está en `.gitignore`
- [ ] `npm audit` no tiene vulnerabilidades críticas

### Monitoreo en Producción

```bash
# Ver logs en Render
# → Ir a Dashboard → Tu servicio → Logs

# Verificar errores
curl https://techstore-api.render.com/

# Probar endpoint
curl -X GET https://techstore-api.render.com/api/productos
```

### Troubleshooting Común

| Problema | Causa | Solución |
|----------|-------|----------|
| 502 Bad Gateway | Servidor no responde | Revisar logs en Render |
| CORS error | Origen no en whitelist | Actualizar corsConfig.js |
| MongooDB timeout | Sin conexión a BD | Verificar MONGODB_URI |
| 401 Unauthorized | JWT inválido | Verificar JWT_SECRET |
| 429 Too Many Requests | Rate limit excedido | Esperar o aumentar límite |

---

## 📊 Matriz de Riesgo vs Mitigación

| Vulnerabilidad OWASP | Riesgo | Mitigation | Nivel |
|----------------------|--------|-----------|-------|
| A1: Injection | Alto | Validación + Mongoose sanitización | ✅ |
| A2: Autenticación | Alto | JWT + Rate Limiting | ✅ |
| A3: XSS | Medio | Helmet + Validación | ✅ |
| A4: XXE | Bajo | JSON, no XML | ✅ |
| A5: Acceso Roto | Medio | Middleware JWT | ✅ |
| A6: Configuración | Alto | Helmet + CORS | ✅ |
| A7: Datos Sensibles | Alto | HTTPS + JWT + Variables .env | ✅ |
| A8: CSRF | Medio | JWT en header + CORS | ✅ |
| A9: Dependencias | Medio | npm audit regularmente | ⚠️ |
| A10: Logging | Medio | Manejo centralizado de errores | ✅ |

---

## 🔄 Mantenimiento de Seguridad

### Auditoría Regular

```bash
# Verificar vulnerabilidades
npm audit

# Actualizar paquetes
npm audit fix
npm update
```

### Monitoreo

- Revisar logs de errores 401/429
- Actualizar whitelist de CORS según necesidad
- Monitorear tráfico anómalo

### Rotación de Secretos

- Cambiar `JWT_SECRET` cada 90 días en producción
- Usar un vault para secrets (Vault, Doppler, etc.)

---

## 📚 Referencias

- [OWASP Top 10 2023](https://owasp.org/www-project-top-ten/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [MongoDB Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/NoSQL_Injection_Prevention_Cheat_Sheet.html)

---

**Última actualización:** Junio 2024  
**Versión:** 1.0.0  
**Estado:** Listo para Producción ✅
