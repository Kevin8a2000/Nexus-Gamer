// ─────────────────────────────────────────────
// MANEJO CENTRALIZADO DE ERRORES
// ─────────────────────────────────────────────

class AppError extends Error {
  constructor(mensaje, codigoEstado) {
    super(mensaje);
    this.codigoEstado = codigoEstado;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Middleware de manejo de errores global
const errorHandler = (err, req, res, next) => {
  err.codigoEstado = err.codigoEstado || 500;

  // Errores de Mongoose
  if (err.name === 'CastError') {
    err.codigoEstado = 400;
    err.message = 'ID inválido';
  }

  if (err.name === 'ValidationError') {
    err.codigoEstado = 400;
    err.message = Object.values(err.errors)
      .map(val => val.message)
      .join(', ');
  }

  if (err.code === 11000) {
    err.codigoEstado = 409;
    const field = Object.keys(err.keyValue)[0];
    err.message = `${field} ya está registrado`;
  }

  // Errores de JWT
  if (err.name === 'JsonWebTokenError') {
    err.codigoEstado = 401;
    err.message = 'Token inválido';
  }

  if (err.name === 'TokenExpiredError') {
    err.codigoEstado = 401;
    err.message = 'Token expirado';
  }

  // Log del error en consola (solo en desarrollo)
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', {
      mensaje: err.message,
      codigoEstado: err.codigoEstado,
      stack: err.stack
    });
  }

  // No revelar detalles en producción
  const mensaje = process.env.NODE_ENV === 'production' 
    ? 'Error del servidor' 
    : err.message;

  res.status(err.codigoEstado).json({
    ok: false,
    mensaje,
    ...(process.env.NODE_ENV === 'development' && { error: err })
  });
};

// Wrapper para funciones async en rutas
const catchAsync = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};

module.exports = {
  AppError,
  errorHandler,
  catchAsync
};
