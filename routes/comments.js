const express = require('express');
const router = express.Router();
const {
  getComments,
  createComment,
  updateComment,
  deleteComment
} = require('../controllers/commentController');
const { authenticateToken } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas de comentarios por tarea
router.get('/task/:taskId', getComments);
router.post('/task/:taskId', createComment);

// Rutas de comentarios individuales
router.put('/:id', updateComment);
router.delete('/:id', deleteComment);

module.exports = router;