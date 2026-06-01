const rateLimit = require('express-rate-limit');

// ─────────────────────────────────────────────
// RATE LIMITER PARA LOGIN (Protección contra fuerza bruta)
// ─────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Ventana de 15 minutos
  max: 5, // Máximo 5 intentos por IP
  message: 'Demasiados intentos de login. Intenta de nuevo en 15 minutos.',
  standardHeaders: true, // Retorna el contador en RateLimit-* headers
  legacyHeaders: false, // Deshabilita X-RateLimit-* headers
  keyGenerator: (req) => {
    // Usar IP del cliente, considerando proxies
    return req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  },
  skip: (req) => {
    // No aplicar rate limit a IPs en desarrollo (opcional)
    return false;
  },
  handler: (req, res) => {
    res.status(429).json({
      ok: false,
      mensaje: 'Demasiados intentos. Por favor, espera 15 minutos antes de intentar de nuevo.',
      intentosRestantes: req.rateLimit.remaining
    });
  }
});

// ─────────────────────────────────────────────
// RATE LIMITER PARA REGISTRO
// ─────────────────────────────────────────────
const registroLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // Ventana de 1 hora
  max: 3, // Máximo 3 registros por IP en 1 hora
  message: 'Demasiados registros desde esta IP. Intenta de nuevo más tarde.',
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  },
  handler: (req, res) => {
    res.status(429).json({
      ok: false,
      mensaje: 'Limite de registros alcanzado. Intenta de nuevo en 1 hora.'
    });
  }
});

// ─────────────────────────────────────────────
// RATE LIMITER GLOBAL (API general)
// ─────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por IP
  message: 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  }
});

// ─────────────────────────────────────────────
// RATE LIMITER PARA VERIFICACIÓN DE EMAIL
// ─────────────────────────────────────────────
const checkEmailLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 20, // Máximo 20 checks por IP
  message: 'Demasiadas verificaciones. Intenta de nuevo más tarde.',
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  }
});

module.exports = {
  loginLimiter,
  registroLimiter,
  globalLimiter,
  checkEmailLimiter
};
