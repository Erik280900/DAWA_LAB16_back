const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { User, Project, Task, Tag, Role, sequelize } = require('../models');
const { Op } = require('sequelize');

// Todas las rutas requieren autenticación y rol de admin
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/admin/stats - Estadísticas generales del sistema
router.get('/stats', async (req, res) => {
  try {
    // Contar totales
    const totalUsers = await User.count();
    const totalProjects = await Project.count();
    const totalTasks = await Task.count();
    const totalTags = await Tag.count();

    // Usuarios activos (usuarios que tienen al menos un proyecto)
    const activeUsers = await User.count({
      include: [{
        model: Project,
        as: 'projects',
        required: true,
        attributes: []
      }],
      distinct: true
    });

    // Tareas por estado
    const completedTasks = await Task.count({ where: { status: 'completed' } });
    const inProgressTasks = await Task.count({ where: { status: 'in_progress' } });
    const pendingTasks = await Task.count({ where: { status: 'pending' } });

    // Actividad reciente (últimas 10 acciones)
    const recentProjects = await Project.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [{ model: User, as: 'user', attributes: ['username'] }]
    });

    const recentTasks = await Task.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [
        { model: Project, as: 'project', attributes: ['name'] }
      ]
    });

    const recentActivity = [
      ...recentProjects.map(p => ({
        type: 'project',
        description: `Proyecto "${p.name}"`,
        date: p.created_at
      })),
      ...recentTasks.map(t => ({
        type: 'task',
        description: `Tarea "${t.title}" en proyecto "${t.project.name}"`,
        date: t.created_at
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProjects,
        totalTasks,
        totalTags,
        activeUsers,
        completedTasks,
        inProgressTasks,
        pendingTasks,
        recentActivity
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas del sistema'
    });
  }
});

// GET /api/admin/users - Lista de todos los usuarios con estadísticas
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({
      include: [
        { 
          model: Role,
          as: 'role',
          attributes: ['id', 'name']
        }
      ],
      attributes: ['id', 'username', 'email', 'created_at'],
      order: [['created_at', 'DESC']]
    });

    // Agregar conteo de proyectos y tareas por usuario
    const usersWithStats = await Promise.all(users.map(async (user) => {
      const projectCount = await Project.count({ where: { user_id: user.id } });
      
      // Contar tareas creadas por el usuario
      const taskCount = await Task.count({ 
        include: [{
          model: Project,
          as: 'project',
          where: { user_id: user.id },
          attributes: []
        }]
      });
      
      return {
        ...user.toJSON(),
        projectCount,
        taskCount
      };
    }));

    res.json({
      success: true,
      data: {
        users: usersWithStats
      }
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener lista de usuarios'
    });
  }
});

// GET /api/admin/projects - Lista de todos los proyectos con estadísticas
router.get('/projects', async (req, res) => {
  try {
    const projects = await Project.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        },
        {
          model: Task,
          as: 'tasks'
        }
      ],
      order: [['created_at', 'DESC']]
    });

    const projectsWithStats = await Promise.all(projects.map(async (project) => {
      const taskCount = project.tasks.length;
      const completedTasks = project.tasks.filter(t => t.status === 'completed').length;
      const inProgressTasks = project.tasks.filter(t => t.status === 'in_progress').length;
      const pendingTasks = project.tasks.filter(t => t.status === 'pending').length;

      return {
        id: project.id,
        name: project.name,
        description: project.description,
        created_at: project.created_at,
        user: project.user,
        taskCount,
        completedTasks,
        inProgressTasks,
        pendingTasks,
        memberCount: 1 // En modo single-user siempre es 1
      };
    }));

    res.json({
      success: true,
      data: {
        projects: projectsWithStats
      }
    });
  } catch (error) {
    console.error('Error al obtener proyectos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener lista de proyectos'
    });
  }
});

// GET /api/admin/tasks - Lista de todas las tareas con detalles
router.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.findAll({
      include: [
        {
          model: Project,
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username']
        },
        {
          model: User,
          as: 'assignees',
          attributes: ['id', 'username'],
          through: { attributes: [] }
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name', 'color'],
          through: { attributes: [] }
        }
      ],
      order: [['created_at', 'DESC']]
    });

    const tasksWithStats = await Promise.all(tasks.map(async (task) => {
      const commentCount = await Comment.count({ where: { task_id: task.id } });
      
      return {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        due_date: task.due_date,
        created_at: task.created_at,
        project: task.project,
        user: task.creator,
        assignees: task.assignees,
        tags: task.tags,
        commentCount
      };
    }));

    res.json({
      success: true,
      data: {
        tasks: tasksWithStats
      }
    });
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener lista de tareas'
    });
  }
});

module.exports = router;
