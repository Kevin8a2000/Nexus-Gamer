# 🛒 TechStore — Backend API REST

Backend del sistema de gestión de inventario TechStore.  
Construido con **Node.js + Express + MongoDB (Mongoose)**.

> **🔒 Seguridad de Nivel Producción:** Protección contra fuerza bruta, XSS, NoSQL injection, CSRF y más. Ver [SEGURIDAD.md](SEGURIDAD.md) para detalles.

---

## 📁 Estructura del proyecto

```
techstore-backend/
├── src/
│   ├── config/
│   │   ├── corsConfig.js            # Configuración CORS segura
│   │   ├── database.js              # Conexión a MongoDB Atlas
│   │   └── helmetConfig.js          # Headers de seguridad HTTP
│   ├── controllers/
│   │   ├── auth.controller.js       # Lógica de autenticación
│   │   └── producto.controller.js   # Lógica CRUD de productos
│   ├── middleware/
│   │   ├── auth.middleware.js       # Verificación de JWT
│   │   ├── authorization.middleware.js  # Control de acceso
│   │   ├── errorHandler.middleware.js   # Manejo centralizado de errores
│   │   ├── nosqlInjection.middleware.js # Prevención de inyecciones
│   │   ├── rateLimit.middleware.js      # Rate limiting y protección contra fuerza bruta
│   │   └── validation.middleware.js     # Validación y sanitización
│   ├── models/
│   │   ├── producto.model.js        # Esquema del producto
│   │   └── usuario.model.js         # Esquema del usuario
│   ├── routes/
│   │   ├── auth.routes.js           # Rutas de autenticación
│   │   └── producto.routes.js       # Rutas de productos (protegidas)
│   └── server.js                    # Punto de entrada
├── .env.example                     # Plantilla de variables de entorno
├── .gitignore                       # Archivos ignorados por Git
├── GUIA_ENDPOINTS_AUTH.md           # Guía de endpoints de autenticación
├── SEGURIDAD.md                     # 📚 Documentación completa de seguridad
├── README.md                        # Este archivo
└── package.json                     # Dependencias y scripts
```

---

## 🔒 Medidas de Seguridad Implementadas

| Vulnerabilidad | Solución | Estado |
|---|---|---|
| **Fuerza Bruta** | Express-rate-limit en login/registro | ✅ |
| **XSS** | Validación + Helmet CSP | ✅ |
| **CORS** | Whitelist de orígenes permitidos | ✅ |
| **Autenticación** | JWT con expiración | ✅ |
| **NoSQL Injection** | Validación + Sanitización de operadores MongoDB | ✅ |
| **Headers Inseguros** | Helmet con configuración segura | ✅ |

**👉 Para más detalles, ver [SEGURIDAD.md](SEGURIDAD.md)**

---

## ⚙️ Instalación y configuración

### 1. Instalar dependencias
```bash
npm install
```

### 2. Crear el archivo `.env`
```bash
cp .env.example .env
```
Luego edita `.env` con tus valores:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/techstore
JWT_SECRET=tu_clave_secreta_super_segura_aqui_min_32_caracteres
JWT_EXPIRE=7d
CORS_ORIGINS=http://localhost:4200,http://localhost:3000
```

### 3. Configurar MongoDB Atlas
1. Entra a [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Crea una cuenta gratuita (o inicia sesión)
3. Crea un **Cluster gratuito (M0)**
4. Ve a **Database Access** → crea un usuario con contraseña
5. Ve a **Network Access** → agrega `0.0.0.0/0` (permite cualquier IP)
6. Ve a **Connect** → elige "Drivers" → copia la cadena de conexión
7. Pégala en tu `.env`

**Modo desarrollo** (con recarga automática):
```bash
npm run dev
```

**Modo producción:**
```bash
npm start
```

El servidor corre en: `http://localhost:3000`

---

## 🔌 Endpoints de la API

Base URL: `http://localhost:3000/api`

### 🔐 Autenticación

#### Registro de usuario
**POST** `/auth/registro`
```json
{
  "nombreCompleto": "Juan Pérez",
  "correo": "juan@example.com",
  "contrasena": "password123",
  "confirmarContrasena": "password123"
}
```
**Respuesta (201):**
```json
{
  "ok": true,
  "mensaje": "Usuario registrado exitosamente",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "usuario": {
    "id": "507f1f77bcf86cd799439011",
    "nombreCompleto": "Juan Pérez",
    "correo": "juan@example.com"
  }
}
```

#### Login
**POST** `/auth/login`
```json
{
  "correo": "juan@example.com",
  "contrasena": "password123"
}
```
**Respuesta (200):**
```json
{
  "ok": true,
  "mensaje": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "usuario": {
    "id": "507f1f77bcf86cd799439011",
    "nombreCompleto": "Juan Pérez",
    "correo": "juan@example.com"
  }
}
```

#### Verificar si el correo existe (sin retrasos) ⚡
**GET** `/auth/check-email?correo=juan@example.com`

**Respuesta (disponible):**
```json
{
  "ok": true,
  "existe": false,
  "mensaje": "El correo está disponible"
}
```

**Respuesta (en uso):**
```json
{
  "ok": false,
  "existe": true,
  "mensaje": "El correo ya está registrado"
}
```

#### Obtener perfil del usuario (requiere token)
**GET** `/auth/perfil`
**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```
**Respuesta (200):**
```json
{
  "ok": true,
  "usuario": {
    "id": "507f1f77bcf86cd799439011",
    "nombreCompleto": "Juan Pérez",
    "correo": "juan@example.com",
    "fechaRegistro": "2024-05-31T10:30:00.000Z"
  }
}
```

---

### 📦 Productos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/productos` | Obtener todos los productos |
| GET | `/productos/:id` | Obtener un producto por ID |
| POST | `/productos` | Crear un nuevo producto |
| PUT | `/productos/:id` | Actualizar un producto |
| DELETE | `/productos/:id` | Eliminar un producto |

---

## 🔑 Características de seguridad

✅ **Contraseñas hasheadas** con bcryptjs (nunca se guardan en texto plano)  
✅ **Tokens JWT** para autenticación segura  
✅ **Validación de correos** con regex  
✅ **Verificación inmediata** de correo existente sin retrasos  
✅ **Índices en MongoDB** para búsquedas rápidas  
✅ **Variable `.env` protegida** en `.gitignore`

---

## 🧪 Pruebas con Postman o Thunder Client
POST http://localhost:3000/api/productos
Content-Type: application/json

{
  "nombre": "Samsung Galaxy S24",
  "categoria": "Smartphones",
  "ubicacion": "Bodega A",
  "precio": 3800000
}
```

**Actualizar producto (PUT):**
```
PUT http://localhost:3000/api/productos/<ID_DEL_PRODUCTO>
Content-Type: application/json

{
  "precio": 3500000,
  "ubicacion": "Vitrina 2"
}
```

---

## 🔗 Conexión con Angular (Frontend)

El CORS está configurado para aceptar peticiones desde `http://localhost:4200`.  
En tu servicio de Angular usa esta URL base:

```typescript
private apiUrl = 'http://localhost:3000/api/productos';
```
