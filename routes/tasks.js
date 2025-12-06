const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  assignTags
} = require('../controllers/taskController');
const { authenticateToken } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Ruta para obtener todas las tareas del usuario
router.get('/', getTasks);

// Rutas de tareas por proyecto
router.get('/project/:projectId', getTasks);
router.post('/project/:projectId', createTask);

// Rutas de tareas individuales
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

// Rutas de asignaciones
router.put('/:id/assign-tags', assignTags);

module.exports = router;