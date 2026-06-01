// ─────────────────────────────────────────────
// MIDDLEWARE DE AUTORIZACIÓN
// ─────────────────────────────────────────────
// Verifica que el usuario solo acceda a sus propios recursos

const { AppError } = require('./errorHandler.middleware');

/**
 * Middleware para verificar que el usuario solo accede a sus propios recursos
 * Uso: router.delete('/:id', verificarToken, autorizarUsuario, controlador);
 */
exports.autorizarUsuario = (req, res, next) => {
  try {
    // req.usuario viene del middleware verificarToken
    if (!req.usuario) {
      return next(new AppError('No autenticado', 401));
    }

    // Verificar que el parámetro ID coincida con el usuario autenticado
    // Comparar strings porque _id puede ser ObjectId y usuarioId puede ser string
    if (req.usuario.id.toString() !== req.params.usuarioId?.toString()) {
      return next(new AppError('No tienes permiso para acceder a este recurso', 403));
    }

    next();
  } catch (error) {
    next(new AppError('Error en autorización', 500));
  }
};

/**
 * Middleware para verificar que el usuario es administrador
 * Requiere campo 'rol' en el documento de Usuario
 */
exports.autorizarAdmin = (req, res, next) => {
  try {
    if (!req.usuario) {
      return next(new AppError('No autenticado', 401));
    }

    if (req.usuario.rol !== 'admin') {
      return next(new AppError('Solo administradores pueden realizar esta acción', 403));
    }

    next();
  } catch (error) {
    next(new AppError('Error en autorización', 500));
  }
};

/**
 * Middleware para verificar propiedad de un producto
 * Verifica que el usuario que crea/modifica sea el propietario
 */
exports.verificarPropietarioProducto = async (req, res, next) => {
  try {
    // Si el usuario está autenticado, verificar que sea el propietario
    if (req.usuario && req.body.propietarioId) {
      if (req.usuario.id.toString() !== req.body.propietarioId.toString()) {
        return next(new AppError('No puedes crear/modificar productos de otros usuarios', 403));
      }
    }
    
    next();
  } catch (error) {
    next(new AppError('Error en verificación de propiedad', 500));
  }
};
