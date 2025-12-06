module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    project_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'review', 'completed'),
      defaultValue: 'pending'
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      defaultValue: 'medium'
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'tasks',
    timestamps: false
  });

  Task.associate = function(models) {
    // Pertenece a un proyecto
    Task.belongsTo(models.Project, {
      foreignKey: 'project_id',
      as: 'project'
    });

    // Puede tener muchas etiquetas (tabla intermedia)
    Task.belongsToMany(models.Tag, {
      through: models.TaskTag,
      foreignKey: 'task_id',
      otherKey: 'tag_id',
      as: 'tags'
    });

    // Puede tener muchos comentarios
    Task.hasMany(models.Comment, {
      foreignKey: 'task_id',
      as: 'comments'
    });
  };

  return Task;
};