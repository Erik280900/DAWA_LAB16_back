const rateLimit = require('express-rate-limit');

// Rate limiting general
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por IP por ventana
  message: {
    success: false,
    message: 'Demasiadas peticiones, intenta de nuevo en 15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting para autenticación (desactivado en desarrollo)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // 1000 intentos (prácticamente sin límite para desarrollo)
  message: {
    success: false,
    message: 'Demasiados intentos de autenticación'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // No contar requests exitosos
});

module.exports = {
  generalLimiter,
  authLimiter
};