const express = require('express');
const router = express.Router();
const {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto
} = require('../controllers/producto.controller');
const { validarProducto, handleValidationErrors } = require('../middleware/validation.middleware');
const authMiddleware = require('../middleware/auth.middleware');
const { middlewareSanitizarNoSQL } = require('../middleware/nosqlInjection.middleware');

// ─────────────────────────────────────────────
// RUTAS DE PRODUCTOS — /api/productos
// ─────────────────────────────────────────────

// RUTAS PÚBLICAS (lectura)
router.get('/',       middlewareSanitizarNoSQL, obtenerProductos);                           // Listar todos
router.get('/:id',    middlewareSanitizarNoSQL, obtenerProductoPorId);                       // Obtener uno por ID

// RUTAS PROTEGIDAS (escritura)
// Requieren token JWT para crear, actualizar o eliminar
router.post(
  '/',
  authMiddleware.verificarToken,
  middlewareSanitizarNoSQL,
  validarProducto,
  handleValidationErrors,
  crearProducto
);

router.put(
  '/:id',
  authMiddleware.verificarToken,
  middlewareSanitizarNoSQL,
  validarProducto,
  handleValidationErrors,
  actualizarProducto
);

router.delete(
  '/:id',
  authMiddleware.verificarToken,
  middlewareSanitizarNoSQL,
  eliminarProducto
);

module.exports = router;
