const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/projectController');
const { authenticateToken, requireProjectOwnerOrAdmin } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas de proyectos
router.get('/', getProjects);
router.post('/', createProject);
router.get('/:id', getProject);
router.put('/:id', requireProjectOwnerOrAdmin, updateProject);
router.delete('/:id', requireProjectOwnerOrAdmin, deleteProject);


module.exports = router;