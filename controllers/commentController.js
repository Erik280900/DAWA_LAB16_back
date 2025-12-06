const { Comment, Task, Project, User } = require('../models');

// Obtener comentarios de una tarea
const getComments = async (req, res) => {
  try {
    const { taskId } = req.params;

    const comments = await Comment.findAll({
      where: { task_id: taskId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email']
      }],
      order: [['created_at', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        comments
      }
    });

  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Crear comentario
const createComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // Validaciones
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El contenido del comentario es requerido'
      });
    }

    // Verificar que la tarea existe y el usuario tiene acceso (propietario del proyecto)
    const task = await Task.findByPk(taskId, { include: [{ model: Project, as: 'project' }] });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }

    const hasAccess = task.project && task.project.user_id === userId;
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta tarea'
      });
    }

    // Crear comentario
    const newComment = await Comment.create({
      task_id: taskId,
      user_id: userId,
      content: content.trim()
    });

    // Obtener comentario con usuario
    const commentWithUser = await Comment.findByPk(newComment.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Comentario creado exitosamente',
      data: {
        comment: commentWithUser
      }
    });

  } catch (error) {
    console.error('Error al crear comentario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar comentario
const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // Validaciones
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El contenido del comentario es requerido'
      });
    }

    // Buscar comentario
    const comment = await Comment.findByPk(id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email']
      }]
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado'
      });
    }

    // Verificar que el usuario es el autor del comentario
    if (comment.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Solo puedes editar tus propios comentarios'
      });
    }

    // Actualizar comentario
    await Comment.update(
      { content: content.trim() },
      { where: { id } }
    );

    // Obtener comentario actualizado
    const updatedComment = await Comment.findByPk(id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email']
      }]
    });

    res.json({
      success: true,
      message: 'Comentario actualizado exitosamente',
      data: {
        comment: updatedComment
      }
    });

  } catch (error) {
    console.error('Error al actualizar comentario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar comentario
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Buscar comentario
    const comment = await Comment.findByPk(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado'
      });
    }

    // Verificar que el usuario es el autor del comentario
    if (comment.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Solo puedes eliminar tus propios comentarios'
      });
    }

    // Eliminar comentario
    await Comment.destroy({ where: { id } });

    res.json({
      success: true,
      message: 'Comentario eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar comentario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  getComments,
  createComment,
  updateComment,
  deleteComment
};