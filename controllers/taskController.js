const { Task, Project, Tag, TaskTag, Comment, User } = require('../models');
const { Op } = require('sequelize');

// Obtener tareas (todas del usuario o de un proyecto específico)
const getTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    if (projectId) {
      // Obtener tareas de un proyecto específico
      const project = await Project.findByPk(projectId);
      if (!project) return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
      const hasAccess = project.user_id === userId || req.user.role.name === 'admin';
      if (!hasAccess) return res.status(403).json({ success: false, message: 'No tienes acceso a este proyecto' });

      const tasks = await Task.findAll({
        where: { project_id: projectId },
        include: [
          {
            model: Tag,
            as: 'tags',
            attributes: ['id', 'name', 'color'],
            through: { attributes: [] }
          },
          {
            model: Comment,
            as: 'comments',
            include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email'] }]
          }
        ],
        order: [['created_at', 'DESC']]
      });

      return res.json({ success: true, data: { tasks } });
    } else {
      // Obtener todas las tareas del usuario (todos sus proyectos)
    // Obtener todas las tareas de los proyectos del usuario
    const userProjects = await Project.findAll({ where: { user_id: userId }, attributes: ['id'] });
    const projectIds = userProjects.map(p => p.id);

    const tasks = await Task.findAll({
      where: { project_id: { [Op.in]: projectIds } },
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: Tag, as: 'tags', attributes: ['id', 'name', 'color'], through: { attributes: [] } },
        { model: Comment, as: 'comments', include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email'] }] }
      ],
      order: [['created_at', 'DESC']]
    });

    return res.json({ success: true, data: { tasks } });
    }

  } catch (error) {
    console.error('Error al obtener tareas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener una tarea específica
const getTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findByPk(id, {
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name', 'user_id'] },
        { model: Tag, as: 'tags', attributes: ['id', 'name', 'color'], through: { attributes: [] } },
        { model: Comment, as: 'comments', include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email'] }], order: [['created_at', 'ASC']] }
      ]
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }

    res.json({
      success: true,
      data: {
        task
      }
    });

  } catch (error) {
    console.error('Error al obtener tarea:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Crear nueva tarea
const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, status, priority, due_date, tags = [] } = req.body;

    // Validaciones
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'El título de la tarea es requerido'
      });
    }

    // Crear tarea y asignaciones en transacción
    const result = await require('../config/database').sequelize.transaction(async (t) => {
      // Crear tarea
      const newTask = await Task.create({
        project_id: projectId,
        title,
        description,
        status: status || 'pending',
        priority: priority || 'medium',
        due_date: due_date ? new Date(due_date) : null
      }, { transaction: t });

      // Asignar etiquetas si se proporcionaron
      if (tags.length > 0) {
        const taskTags = tags.map(tagId => ({ task_id: newTask.id, tag_id: tagId }));
        await TaskTag.bulkCreate(taskTags, { transaction: t });
      }

      return newTask;
    });

    // Obtener tarea con todas las relaciones
    const taskWithDetails = await Task.findByPk(result.id, {
      include: [ { model: Tag, as: 'tags', attributes: ['id', 'name', 'color'], through: { attributes: [] } } ]
    });

    res.status(201).json({
      success: true,
      message: 'Tarea creada exitosamente',
      data: {
        task: taskWithDetails
      }
    });

  } catch (error) {
    console.error('Error al crear tarea:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar tarea
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, due_date, tags } = req.body;

    // Validar que al menos un campo esté presente
    if (!title && !description && !status && !priority && due_date === undefined && tags === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere al menos un campo para actualizar'
      });
    }

    const updateData = { updated_at: new Date() };
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (due_date !== undefined) updateData.due_date = due_date ? new Date(due_date) : null;

    // Actualizar en transacción si hay tags
    if (tags !== undefined) {
      await require('../config/database').sequelize.transaction(async (t) => {
        // Actualizar campos de la tarea
        const [updatedRows] = await Task.update(updateData, {
          where: { id },
          transaction: t
        });

        if (updatedRows === 0) {
          throw new Error('Tarea no encontrada');
        }

        // Eliminar etiquetas existentes
        await TaskTag.destroy({
          where: { task_id: id },
          transaction: t
        });

        // Agregar nuevas etiquetas
        if (Array.isArray(tags) && tags.length > 0) {
          const taskTags = tags.map(tagId => ({ task_id: id, tag_id: tagId }));
          await TaskTag.bulkCreate(taskTags, { transaction: t });
        }
      });
    } else {
      // Actualizar sin manejar tags
      const [updatedRows] = await Task.update(updateData, {
        where: { id }
      });

      if (updatedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Tarea no encontrada'
        });
      }
    }

    // Obtener tarea actualizada
    const updatedTask = await Task.findByPk(id, { include: [ { model: Tag, as: 'tags', attributes: ['id', 'name', 'color'], through: { attributes: [] } } ] });

    res.json({
      success: true,
      message: 'Tarea actualizada exitosamente',
      data: {
        task: updatedTask
      }
    });

  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    res.status(500).json({
      success: false,
      message: error.message === 'Tarea no encontrada' ? error.message : 'Error interno del servidor'
    });
  }
};

// Eliminar tarea
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRows = await Task.destroy({
      where: { id }
    });

    if (deletedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Tarea eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// (assignUsers removed — tasks are personal to project owner)

// Asignar etiquetas a una tarea
const assignTags = async (req, res) => {
  try {
    const { id } = req.params; // task id
    const { tagIds } = req.body;

    // Validaciones
    if (!Array.isArray(tagIds)) {
      return res.status(400).json({
        success: false,
        message: 'tagIds debe ser un array'
      });
    }

    // Realizar asignación en transacción
    await require('../config/database').sequelize.transaction(async (t) => {
      // Eliminar etiquetas existentes
      await TaskTag.destroy({
        where: { task_id: id }
      }, { transaction: t });

      // Crear nuevas asignaciones
      if (tagIds.length > 0) {
        const taskTags = tagIds.map(tagId => ({
          task_id: id,
          tag_id: tagId
        }));
        await TaskTag.bulkCreate(taskTags, { transaction: t });
      }
    });

    // Obtener tarea con etiquetas actualizadas
    const taskWithTags = await Task.findByPk(id, {
      include: [{
        model: Tag,
        as: 'tags',
        attributes: ['id', 'name', 'color'],
        through: { attributes: [] }
      }]
    });

    res.json({
      success: true,
      message: 'Etiquetas actualizadas exitosamente',
      data: {
        task: taskWithTags
      }
    });

  } catch (error) {
    console.error('Error al asignar etiquetas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  assignTags
};