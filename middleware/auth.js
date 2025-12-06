const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

// Middleware para verificar JWT
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    console.log('Auth header:', authHeader); // Debug log
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      console.log('No token provided'); // Debug log
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded:', decoded); // Debug log
    
    // Buscar usuario en la base de datos
    const user = await User.findByPk(decoded.id, {
      include: [{
        model: Role,
        as: 'role',
        attributes: ['id', 'name']
      }],
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Middleware para verificar rol específico
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    const userRole = req.user.role.name;
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Permisos insuficientes'
      });
    }

    next();
  };
};

// Middleware para verificar si es admin
const requireAdmin = requireRole(['admin']);

// Middleware para verificar si es el dueño del proyecto o admin
const requireProjectOwnerOrAdmin = async (req, res, next) => {
  try {
    const { Project } = require('../models');
    const projectId = req.params.id || req.params.projectId;
    
    const project = await Project.findByPk(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }

    const isOwner = project.user_id === req.user.id;
    const isAdmin = req.user.role.name === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Solo el dueño del proyecto o un administrador puede realizar esta acción'
      });
    }

    req.project = project;
    next();
  } catch (error) {
    console.error('Error en verificación de permisos:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireProjectOwnerOrAdmin
};