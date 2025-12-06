const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { testConnection, syncDatabase } = require('./config/database');
const routes = require('./routes');

const app = express();

// CORS configurado (debe ir ANTES del rate limiter)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middlewares de seguridad y utilidad
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Middleware para parsing de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rutas principales
app.use('/api', routes);

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Sistema de Gestión de Tareas y Proyectos - API Backend',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      projects: '/api/projects',
      tasks: '/api/tasks',
      comments: '/api/comments',
      tags: '/api/tags',
      health: '/api/health'
    }
  });
});

// Middleware para manejar rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Configuración del puerto
const PORT = process.env.PORT || 4000;

// Función para inicializar el servidor
const startServer = async () => {
  try {
    // Probar conexión a la base de datos
    await testConnection();
    
    // Sincronizar modelos (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      await syncDatabase();
    }
    
    // Crear datos iniciales si no existen
    await createInitialData();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`🌍 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
      console.log(`🔧 Modo: ${process.env.NODE_ENV || 'development'}`);
    });
    
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Función para crear datos iniciales
const createInitialData = async () => {
  try {
    const { Role } = require('./models');
    
    // Crear roles por defecto si no existen
    const adminRole = await Role.findOrCreate({
      where: { name: 'admin' },
      defaults: { name: 'admin' }
    });
    
    const userRole = await Role.findOrCreate({
      where: { name: 'user' },
      defaults: { name: 'user' }
    });
    
    console.log('✅ Datos iniciales verificados');
  } catch (error) {
    console.error('❌ Error al crear datos iniciales:', error);
  }
};

// Manejo graceful de señales
process.on('SIGINT', () => {
  console.log('🔄 Cerrando servidor gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🔄 Cerrando servidor gracefully...');
  process.exit(0);
});

// Iniciar servidor
startServer();
