const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

// Importar todos los modelos
const Role = require('./Role');
const User = require('./User');
const Project = require('./Project');
const Task = require('./Task');
const Tag = require('./Tag');
const Comment = require('./Comment');
const TaskTag = require('./TaskTag');

// Inicializar modelos con sequelize
const models = {
  Role: Role(sequelize, DataTypes),
  User: User(sequelize, DataTypes),
  Project: Project(sequelize, DataTypes),
  Task: Task(sequelize, DataTypes),
  Tag: Tag(sequelize, DataTypes),
  Comment: Comment(sequelize, DataTypes),
  TaskTag: TaskTag(sequelize, DataTypes)
};

// Establecer asociaciones
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Sincronizar base de datos
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: false }); // Cambiar a true solo en desarrollo
    console.log('✅ Modelos sincronizados correctamente');
  } catch (error) {
    console.error('❌ Error al sincronizar modelos:', error);
  }
};

module.exports = {
  sequelize,
  syncDatabase,
  ...models
};