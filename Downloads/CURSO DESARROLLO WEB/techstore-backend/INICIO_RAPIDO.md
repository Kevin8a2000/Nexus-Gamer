# 🚀 Inicio Rápido - TechStore Backend

## 1️⃣ Instalación Local

```bash
# Clonar y entrar al directorio
git clone <tu-repo>
cd techstore-backend

# Instalar dependencias
npm install

# Copiar y configurar variables de entorno
cp .env.example .env
# Edita .env con tus valores de MongoDB y JWT_SECRET

# Iniciar servidor en desarrollo
npm run dev  # Con nodemon (reinicia automáticamente)
# O si no tienes nodemon:
npm start

# Servidor disponible en: http://localhost:3000
```

---

## 2️⃣ Prueba Rápida de Endpoints

### Verificar que el servidor está vivo

```bash
curl http://localhost:3000/
```

### Registrar usuario

```bash
curl -X POST http://localhost:3000/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "nombreCompleto": "Juan Pérez",
    "correo": "juan@example.com",
    "contrasena": "Password123",
    "confirmarContrasena": "Password123"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "correo": "juan@example.com",
    "contrasena": "Password123"
  }'
```

Guardas el token retornado y lo usas en requests protegidos:

```bash
curl http://localhost:3000/api/auth/perfil \
  -H "Authorization: Bearer <tu-token-aqui>"
```

---

## 3️⃣ Scripts Disponibles

```bash
npm start          # Iniciar servidor en producción
npm run dev        # Iniciar con nodemon (desarrollo)
npm audit          # Verificar vulnerabilidades
npm audit fix      # Arreglar vulnerabilidades automáticamente
npm run security   # npm audit + npm audit fix
```

---

## 4️⃣ Estructura de Archivos Clave

### Configuración de Seguridad

- **`src/config/corsConfig.js`** → Whitelist de orígenes permitidos
- **`src/config/helmetConfig.js`** → Headers HTTP de seguridad
- **`src/middleware/rateLimit.middleware.js`** → Protección contra fuerza bruta
- **`src/middleware/auth.middleware.js`** → Verificación de JWT
- **`src/middleware/authorization.middleware.js`** → Control de acceso
- **`src/middleware/nosqlInjection.middleware.js`** → Prevención de inyecciones
- **`src/middleware/validation.middleware.js`** → Validación y sanitización XSS

### Rutas

- **`src/routes/auth.routes.js`** → Endpoints de autenticación
- **`src/routes/producto.routes.js`** → Endpoints de productos (con autenticación)

---

## 5️⃣ Variables de Entorno Esenciales

```env
PORT=3000                           # Puerto del servidor
NODE_ENV=development                # development o production

# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/techstore

# JWT - Seguridad
JWT_SECRET=mi_clave_super_segura_aqui_32_caracteres_minimo
JWT_EXPIRE=7d

# CORS - Orígenes permitidos
CORS_ORIGINS=http://localhost:4200,https://techstore.vercel.app
```

---

## 6️⃣ Despliegue en Render (Backend)

1. **Pushear a GitHub**
   ```bash
   git add .
   git commit -m "feat: implementar seguridad completa"
   git push origin main
   ```

2. **Conectar con Render**
   - Ir a [render.com](https://render.com) → New Web Service
   - Conectar GitHub
   - Build: `npm install`
   - Start: `npm start`
   - Agregar variables en Settings → Environment

3. **Agregar Variables en Render**
   ```
   MONGODB_URI = [tu conexión atlas]
   JWT_SECRET = [clave aleatoria de 32+ caracteres]
   NODE_ENV = production
   CORS_ORIGINS = https://techstore.vercel.app,https://tu-backend.render.com
   ```

---

## 7️⃣ Despliegue de Frontend en Vercel

1. **Pushear frontend a GitHub**

2. **Conectar con Vercel**
   - Ir a [vercel.com](https://vercel.com)
   - Conectar GitHub
   - Importar repo del frontend

3. **Agregar Variable de Entorno**
   ```
   REACT_APP_API_URL = https://tu-backend.render.com
   ```

---

## 8️⃣ Validación Pre-Deployment

- [ ] `npm audit` sin vulnerabilidades críticas
- [ ] `.env` no está committeado (en `.gitignore`)
- [ ] `NODE_ENV=production` en variables del servidor
- [ ] `JWT_SECRET` tiene 32+ caracteres
- [ ] `MONGODB_URI` es de producción
- [ ] CORS whitelist actualizado
- [ ] Prueba login desde cliente

---

## 9️⃣ Documentación Completa

- 📚 **[SEGURIDAD.md](SEGURIDAD.md)** → Todas las medidas de seguridad
- 📖 **[GUIA_ENDPOINTS_AUTH.md](GUIA_ENDPOINTS_AUTH.md)** → Ejemplos de endpoints
- 🛠️ **[README.md](README.md)** → Información general del proyecto

---

## 🆘 Troubleshooting

| Problema | Solución |
|----------|----------|
| `ECONNREFUSED MongoDB` | Verificar `MONGODB_URI` en `.env` |
| `CORS Error` | Actualizar `corsConfig.js` o variable `CORS_ORIGINS` |
| `401 Unauthorized` | Token JWT inválido o expirado |
| `429 Too Many Requests` | Esperar 15 minutos (rate limit de login) |
| `ValidationError` | Revisar campos obligatorios y tipos de datos |

---

## 📞 Soporte

Para más información sobre vulnerabilidades específicas y soluciones:

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Express.js Security: https://expressjs.com/en/advanced/best-practice-security.html
- Helmet.js: https://helmetjs.github.io/

---

**Última actualización:** Junio 2024  
**Versión:** 1.0.0  
**Estado:** Listo para Producción ✅
