require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');
const corsOptions = require('./config/corsConfig');
const helmetConfig = require('./config/helmetConfig');
const { globalLimiter } = require('./middleware/rateLimit.middleware');
const { middlewareSanitizarNoSQL } = require('./middleware/nosqlInjection.middleware');
const { errorHandler } = require('./middleware/errorHandler.middleware');
const productoRoutes = require('./routes/producto.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// ─────────────────────────────────────────────
// CONEXIÓN A MONGODB
// ─────────────────────────────────────────────
connectDB();

// ─────────────────────────────────────────────
// MIDDLEWARES GLOBALES DE SEGURIDAD
// ─────────────────────────────────────────────

// Helmet - Cabeceras seguras
app.use(helmet(helmetConfig));

// CORS - Configuración segura con whitelist
app.use(cors(corsOptions));

// Parsear JSON en el body de las peticiones
app.use(express.json({ limit: '10kb' })); // Limitar tamaño de payload

// Parsear cookies
app.use(cookieParser());

// Sanitización contra NoSQL Injection (global)
app.use(middlewareSanitizarNoSQL);

// Rate limiter global
app.use(globalLimiter);

// ─────────────────────────────────────────────
// RUTAS
// ─────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/productos', productoRoutes);

// Ruta raíz — verificación de que el servidor está vivo
app.get('/', (req, res) => {
  res.json({
    mensaje: '🛒 TechStore API corriendo correctamente',
    version: '1.0.0',
    endpoints: {
      autenticacion: '/api/auth',
      productos: '/api/productos'
    }
  });
});

// Ruta no encontrada (404)
app.use((req, res) => {
  res.status(404).json({ ok: false, mensaje: `Ruta ${req.originalUrl} no encontrada` });
});

// ─────────────────────────────────────────────
// MANEJO CENTRALIZADO DE ERRORES
// ─────────────────────────────────────────────
app.use(errorHandler);

// ─────────────────────────────────────────────
// INICIO DEL SERVIDOR
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Servidor TechStore corriendo en http://localhost:${PORT}`);
  console.log(`🔒 Seguridad habilitada: Helmet + CORS + Rate Limiting + Validación + NoSQL Injection Protection`);
});

module.exports = app;
