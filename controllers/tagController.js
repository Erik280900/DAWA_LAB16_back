const { Tag, TaskTag } = require('../models');

// Obtener todas las etiquetas
const getTags = async (req, res) => {
  try {
    const userId = req.user.id;
    const tags = await Tag.findAll({ where: { user_id: userId }, order: [['name', 'ASC']] });

    res.json({
      success: true,
      data: {
        tags
      }
    });

  } catch (error) {
    console.error('Error al obtener etiquetas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener una etiqueta específica
const getTag = async (req, res) => {
  try {
    const { id } = req.params;

    const tag = await Tag.findByPk(id);

    if (!tag || (tag.user_id !== req.user.id && req.user.role.name !== 'admin')) {
      return res.status(404).json({ success: false, message: 'Etiqueta no encontrada' });
    }

    res.json({ success: true, data: { tag } });

  } catch (error) {
    console.error('Error al obtener etiqueta:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Crear nueva etiqueta
const createTag = async (req, res) => {
  try {
    const { name, color } = req.body;

    // Validaciones
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de la etiqueta es requerido'
      });
    }

    if (name.length > 30) {
      return res.status(400).json({
        success: false,
        message: 'El nombre no puede tener más de 30 caracteres'
      });
    }

    // Verificar si ya existe una etiqueta con ese nombre
    const existingTag = await Tag.findOne({
      where: { name: name.trim() }
    });

    if (existingTag) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una etiqueta con ese nombre'
      });
    }

    // Validar color si se proporciona
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    if (color && !hexColorRegex.test(color)) {
      return res.status(400).json({
        success: false,
        message: 'El color debe ser un código hexadecimal válido (ej: #FF5733)'
      });
    }

    // Crear etiqueta vinculada al usuario
    const newTag = await Tag.create({
      user_id: req.user.id,
      name: name.trim(),
      color: color || '#6B7280'
    });

    res.status(201).json({
      success: true,
      message: 'Etiqueta creada exitosamente',
      data: {
        tag: newTag
      }
    });

  } catch (error) {
    console.error('Error al crear etiqueta:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar etiqueta
const updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;

    // Validar que al menos un campo esté presente
    if (!name && !color) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere al menos un campo para actualizar'
      });
    }

    const updateData = {};

    if (name) {
      if (name.length > 30) {
        return res.status(400).json({
          success: false,
          message: 'El nombre no puede tener más de 30 caracteres'
        });
      }

      // Verificar si ya existe otra etiqueta con ese nombre
      const existingTag = await Tag.findOne({
        where: { 
          name: name.trim(),
          id: { [require('sequelize').Op.ne]: id }
        }
      });

      if (existingTag) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe una etiqueta con ese nombre'
        });
      }

      updateData.name = name.trim();
    }

    if (color) {
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
      if (!hexColorRegex.test(color)) {
        return res.status(400).json({
          success: false,
          message: 'El color debe ser un código hexadecimal válido (ej: #FF5733)'
        });
      }
      updateData.color = color;
    }

    const [updatedRows] = await Tag.update(updateData, { where: { id, user_id: req.user.id } });

    if (updatedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Etiqueta no encontrada'
      });
    }

    // Obtener etiqueta actualizada
    const updatedTag = await Tag.findOne({ where: { id, user_id: req.user.id } });

    res.json({
      success: true,
      message: 'Etiqueta actualizada exitosamente',
      data: {
        tag: updatedTag
      }
    });

  } catch (error) {
    console.error('Error al actualizar etiqueta:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar etiqueta
const deleteTag = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si la etiqueta está en uso
    const tagInUse = await TaskTag.findOne({ where: { tag_id: id } });

    if (tagInUse) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar la etiqueta porque está siendo utilizada en una o más tareas'
      });
    }

    const deletedRows = await Tag.destroy({ where: { id, user_id: req.user.id } });

    if (deletedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Etiqueta no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Etiqueta eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar etiqueta:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  getTags,
  getTag,
  createTag,
  updateTag,
  deleteTag
};