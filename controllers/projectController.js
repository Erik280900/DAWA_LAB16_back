const { Project, User, Task, Tag, Comment } = require('../models');
const { Op } = require('sequelize');

// Obtener todos los proyectos del usuario
const getProjects = async (req, res) => {
  try {
    const userId = req.user.id;

    // Proyectos personales del usuario
    const projects = await Project.findAll({
      where: { user_id: userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        },
        {
          model: Task,
          as: 'tasks',
          attributes: ['id', 'title', 'status', 'priority']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({ success: true, data: { projects } });
  } catch (error) {
    console.error('Error al obtener proyectos:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// Obtener un proyecto específico
const getProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const project = await Project.findOne({
      where: { id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        },
        {
          model: Task,
          as: 'tasks',
          include: [
            {
              model: Tag,
              as: 'tags',
              attributes: ['id', 'name', 'color'],
              through: { attributes: [] }
            }
          ]
        }
      ]
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
    }

    // Verificar que el proyecto pertenece al usuario
    if (project.user_id !== userId) {
      return res.status(403).json({ success: false, message: 'No tienes acceso a este proyecto' });
    }

    res.json({ success: true, data: { project } });
  } catch (error) {
    console.error('Error al obtener proyecto:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// Crear nuevo proyecto
const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({ success: false, message: 'El nombre del proyecto es requerido' });
    }

    const newProject = await Project.create({
      name: name.trim(),
      description: description || null,
      user_id: userId
    });

    const projectWithDetails = await Project.findByPk(newProject.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email'] }]
    });

    res.status(201).json({ success: true, message: 'Proyecto creado exitosamente', data: { project: projectWithDetails } });
  } catch (error) {
    console.error('Error al crear proyecto:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// Actualizar proyecto
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name && !description) {
      return res.status(400).json({ success: false, message: 'Se requiere al menos un campo para actualizar' });
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description;

    const [updatedRows] = await Project.update(updateData, { where: { id } });

    if (updatedRows === 0) return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });

    const updatedProject = await Project.findByPk(id, { include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email'] }] });

    res.json({ success: true, message: 'Proyecto actualizado exitosamente', data: { project: updatedProject } });
  } catch (error) {
    console.error('Error al actualizar proyecto:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// Eliminar proyecto
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRows = await Project.destroy({ where: { id } });
    if (deletedRows === 0) return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
    res.json({ success: true, message: 'Proyecto eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar proyecto:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};


module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject
};