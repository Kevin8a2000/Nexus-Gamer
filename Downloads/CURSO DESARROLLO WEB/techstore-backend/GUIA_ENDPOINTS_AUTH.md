🔐 TECHSTORE - GUÍA DE PRUEBA DE ENDPOINTS DE AUTENTICACIÓN

Base URL: http://localhost:3000/api

═══════════════════════════════════════════════════════════════════════════════

1️⃣ VERIFICAR DISPONIBILIDAD DE CORREO (RESPUESTA INMEDIATA ⚡)
   
   Endpoint: GET /auth/check-email
   Parámetro: ?correo=usuario@example.com
   
   Ejemplo en Thunder Client / Postman:
   GET http://localhost:3000/api/auth/check-email?correo=test@gmail.com

   ✅ Si el correo está disponible:
   {
     "ok": true,
     "existe": false,
     "mensaje": "El correo está disponible"
   }

   ❌ Si el correo ya existe:
   {
     "ok": false,
     "existe": true,
     "mensaje": "El correo ya está registrado"
   }

═══════════════════════════════════════════════════════════════════════════════

2️⃣ REGISTRO DE NUEVO USUARIO

   Endpoint: POST /auth/registro
   Headers: Content-Type: application/json
   
   URL: http://localhost:3000/api/auth/registro
   
   Body (JSON):
   {
     "nombreCompleto": "Juan Pérez García",
     "correo": "juan@gmail.com",
     "contrasena": "password123",
     "confirmarContrasena": "password123"
   }

   ✅ Respuesta exitosa (201):
   {
     "ok": true,
     "mensaje": "Usuario registrado exitosamente",
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "usuario": {
       "id": "507f1f77bcf86cd799439011",
       "nombreCompleto": "Juan Pérez García",
       "correo": "juan@gmail.com"
     }
   }

   ❌ Errores posibles:
   - Campos obligatorios faltantes (400)
   - Contraseñas no coinciden (400)
   - El correo ya está registrado (400)

═══════════════════════════════════════════════════════════════════════════════

3️⃣ LOGIN / INICIAR SESIÓN

   Endpoint: POST /auth/login
   Headers: Content-Type: application/json
   
   URL: http://localhost:3000/api/auth/login
   
   Body (JSON):
   {
     "correo": "juan@gmail.com",
     "contrasena": "password123"
   }

   ✅ Respuesta exitosa (200):
   {
     "ok": true,
     "mensaje": "Login exitoso",
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "usuario": {
       "id": "507f1f77bcf86cd799439011",
       "nombreCompleto": "Juan Pérez García",
       "correo": "juan@gmail.com"
     }
   }

   ❌ Errores posibles:
   - Correo o contraseña incorrectos (401)
   - Campos obligatorios faltantes (400)

═══════════════════════════════════════════════════════════════════════════════

4️⃣ OBTENER PERFIL DEL USUARIO (REQUIERE TOKEN)

   Endpoint: GET /auth/perfil
   Headers: 
   - Content-Type: application/json
   - Authorization: Bearer <token_aqui>
   
   URL: http://localhost:3000/api/auth/perfil
   
   Reemplaza <token_aqui> con el token obtenido en login/registro

   ✅ Respuesta exitosa (200):
   {
     "ok": true,
     "usuario": {
       "id": "507f1f77bcf86cd799439011",
       "nombreCompleto": "Juan Pérez García",
       "correo": "juan@gmail.com",
       "fechaRegistro": "2024-05-31T14:30:45.123Z"
     }
   }

   ❌ Errores posibles:
   - Token no proporcionado (401)
   - Token inválido (401)
   - Token expirado (401)

═══════════════════════════════════════════════════════════════════════════════

📝 VALIDACIONES IMPLEMENTADAS:

✓ Nombre: mínimo 3 caracteres
✓ Correo: formato válido con regex, único en la BD
✓ Contraseña: mínimo 6 caracteres
✓ Confirmación: debe coincidir con contraseña
✓ Búsqueda de correo: INMEDIATA (con índice en MongoDB)
✓ Token JWT: válido por 7 días

═══════════════════════════════════════════════════════════════════════════════

🔒 SEGURIDAD:

✓ Contraseñas hasheadas con bcryptjs
✓ Tokens firmados con JWT
✓ Índices en MongoDB para búsquedas rápidas
✓ Validación de email con regex
✓ Respuestas genéricas en errores de login
✓ Secreto JWT protegido en .env

═══════════════════════════════════════════════════════════════════════════════
