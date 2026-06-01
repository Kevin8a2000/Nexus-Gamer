const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { loginLimiter, registroLimiter, checkEmailLimiter } = require('../middleware/rateLimit.middleware');
const { validarRegistro, validarLogin, validarCheckEmail, handleValidationErrors } = require('../middleware/validation.middleware');

// ─────────────────────────────────────────────
// RUTAS PÚBLICAS (sin autenticación)
// ─────────────────────────────────────────────

// Registro de nuevo usuario con protección contra fuerza bruta
// POST /api/auth/registro
// Body: { nombreCompleto, correo, contrasena, confirmarContrasena }
router.post('/registro', registroLimiter, validarRegistro, handleValidationErrors, authController.registro);

// Login con protección contra fuerza bruta
// POST /api/auth/login
// Body: { correo, contrasena }
router.post('/login', loginLimiter, validarLogin, handleValidationErrors, authController.login);

// Verificar si el correo existe (respuesta inmediata, con rate limit)
// GET /api/auth/check-email?correo=usuario@example.com
router.get('/check-email', checkEmailLimiter, validarCheckEmail, handleValidationErrors, authController.verificarCorreo);

// ─────────────────────────────────────────────
// RUTAS PROTEGIDAS (requieren token JWT)
// ─────────────────────────────────────────────

// Obtener perfil del usuario autenticado
// GET /api/auth/perfil
// Headers: { Authorization: "Bearer token_aqui" }
router.get('/perfil', authMiddleware.verificarToken, authController.obtenerPerfil);

module.exports = router;
