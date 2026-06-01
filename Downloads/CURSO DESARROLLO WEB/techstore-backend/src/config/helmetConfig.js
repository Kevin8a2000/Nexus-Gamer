// ─────────────────────────────────────────────
// CONFIGURACIÓN DE HELMET PARA SEGURIDAD
// ─────────────────────────────────────────────

const helmetConfig = {
  // Content Security Policy - Previene XSS
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
    },
  },
  
  // X-Frame-Options - Previene clickjacking
  frameguard: { action: 'deny' },
  
  // X-Content-Type-Options - Previene MIME sniffing
  noSniff: true,
  
  // Referrer-Policy - Controla información de referrer
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  
  // X-XSS-Protection - Protección adicional contra XSS
  xssFilter: true,
  
  // HSTS - Force HTTPS en producción
  hsts: {
    maxAge: 31536000, // 1 año
    includeSubDomains: true,
    preload: true,
  },
  
  // DNS Prefetch Control
  dnsPrefetchControl: { allow: false },
  
  // Disable X-Powered-By header
  hidePoweredBy: true,
};

module.exports = helmetConfig;
