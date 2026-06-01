const { body, query, validationResult } = require('express-validator');

// ─────────────────────────────────────────────
// FUNCIONES AUXILIARES DE SANITIZACIÓN XSS
// ─────────────────────────────────────────────

/**
 * Escape básico de caracteres potencialmente peligrosos
 * Previene inyección de scripts en strings
 */
const escaparXSS = (valor) => {
  if (typeof valor !== 'string') return valor;
  
  const mapa = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  
  return valor.replace(/[&<>"'\/]/g, char => mapa[char]);
};

/**
 * Validador personalizado: solo caracteres alfanuméricos y espacios
 */
const soloLetrasYEspacios = (valor) => {
  const regex = /^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]+$/;
  if (!regex.test(valor)) {
    throw new Error('Solo se permiten letras y espacios');
  }
  return true;
};

/**
 * Validador personalizado: previene patrones comunes de XSS
 */
const noContienePalabrasClaveXSS = (valor) => {
  const palabrasClaveXSS = ['<script', '<?', '%>', 'onerror=', 'onload=', 'onclick=', 'javascript:'];
  const valorLower = valor.toLowerCase();
  
  for (const palabra of palabrasClaveXSS) {
    if (valorLower.includes(palabra)) {
      throw new Error('Texto contiene caracteres no permitidos');
    }
  }
  return true;
};

// ─────────────────────────────────────────────
// VALIDACIONES DE REGISTRO
// ─────────────────────────────────────────────
const validarRegistro = [
  body('nombreCompleto')
    .trim()
    .notEmpty().withMessage('El nombre completo es obligatorio')
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres')
    .custom(soloLetrasYEspacios)
    .custom(noContienePalabrasClaveXSS),
  
  body('correo')
    .trim()
    .notEmpty().withMessage('El correo es obligatorio')
    .isEmail().withMessage('El correo debe ser válido')
    .isLength({ max: 255 }).withMessage('El correo es demasiado largo')
    .normalizeEmail()
    .custom(noContienePalabrasClaveXSS),
  
  body('contrasena')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 6, max: 128 }).withMessage('La contraseña debe tener entre 6 y 128 caracteres')
    .matches(/(?=.*[a-z])/).withMessage('La contraseña debe contener al menos una letra minúscula')
    .matches(/(?=.*[A-Z])/).withMessage('La contraseña debe contener al menos una letra mayúscula')
    .matches(/(?=.*\d)/).withMessage('La contraseña debe contener al menos un número'),
  
  body('confirmarContrasena')
    .notEmpty().withMessage('Debe confirmar la contraseña')
    .custom((value, { req }) => {
      if (value !== req.body.contrasena) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    })
];

// ─────────────────────────────────────────────
// VALIDACIONES DE LOGIN
// ─────────────────────────────────────────────
const validarLogin = [
  body('correo')
    .trim()
    .notEmpty().withMessage('El correo es obligatorio')
    .isEmail().withMessage('El correo debe ser válido')
    .isLength({ max: 255 }).withMessage('El correo es demasiado largo')
    .normalizeEmail()
    .custom(noContienePalabrasClaveXSS),
  
  body('contrasena')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 6, max: 128 }).withMessage('La contraseña debe tener entre 6 y 128 caracteres')
];

// ─────────────────────────────────────────────
// VALIDACIÓN DE VERIFICACIÓN DE EMAIL
// ─────────────────────────────────────────────
const validarCheckEmail = [
  query('correo')
    .trim()
    .notEmpty().withMessage('El correo es obligatorio')
    .isEmail().withMessage('El correo debe ser válido')
    .isLength({ max: 255 }).withMessage('El correo es demasiado largo')
    .normalizeEmail()
];

// ─────────────────────────────────────────────
// VALIDACIONES DE PRODUCTO
// ─────────────────────────────────────────────
const validarProducto = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres')
    .custom(noContienePalabrasClaveXSS)
    .escape(), // Escapa caracteres especiales
  
  body('categoria')
    .trim()
    .notEmpty().withMessage('La categoría es obligatoria')
    .isIn(['Smartphones', 'Laptops', 'Tablets', 'Accesorios', 'Computadores de Escritorio', 'Audio', 'Televisores', 'Cámaras', 'Wearables', 'Otro'])
    .withMessage('Categoría no válida'),
  
  body('ubicacion')
    .trim()
    .notEmpty().withMessage('La ubicación es obligatoria')
    .isLength({ min: 2, max: 50 }).withMessage('La ubicación debe tener entre 2 y 50 caracteres')
    .custom(noContienePalabrasClaveXSS)
    .escape(), // Escapa caracteres especiales
  
  body('precio')
    .notEmpty().withMessage('El precio es obligatorio')
    .isFloat({ min: 0 }).withMessage('El precio debe ser un número válido mayor o igual a 0')
];

// ─────────────────────────────────────────────
// MIDDLEWARE PARA MANEJAR ERRORES DE VALIDACIÓN
// ─────────────────────────────────────────────
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Error de validación',
      errores: errors.array().map(err => ({
        campo: err.param,
        mensaje: err.msg
      }))
    });
  }
  next();
};

module.exports = {
  validarRegistro,
  validarLogin,
  validarCheckEmail,
  validarProducto,
  handleValidationErrors,
  escaparXSS,
  noContienePalabrasClaveXSS
};
