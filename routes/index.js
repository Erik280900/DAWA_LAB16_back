const express = require('express');
const router = express.Router();

// Importar rutas de módulos
const authRoutes = require('./auth');
const projectRoutes = require('./projects');
const taskRoutes = require('./tasks');
const commentRoutes = require('./comments');
const tagRoutes = require('./tags');
const adminRoutes = require('./admin');

// Usar rutas
router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/comments', commentRoutes);
router.use('/tags', tagRoutes);
router.use('/admin', adminRoutes);

// Ruta de prueba
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;