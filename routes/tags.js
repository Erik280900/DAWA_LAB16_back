const express = require('express');
const router = express.Router();
const {
  getTags,
  getTag,
  createTag,
  updateTag,
  deleteTag
} = require('../controllers/tagController');
const { authenticateToken } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas de etiquetas
router.get('/', getTags);
router.post('/', createTag);
router.get('/:id', getTag);
router.put('/:id', updateTag);
router.delete('/:id', deleteTag);

module.exports = router;