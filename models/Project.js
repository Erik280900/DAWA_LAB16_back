module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define('Project', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'projects',
    timestamps: false
  });

  Project.associate = function(models) {
    // Pertenece a un usuario (owner)
    Project.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    // Puede tener muchas tareas
    Project.hasMany(models.Task, {
      foreignKey: 'project_id',
      as: 'tasks'
    });
  };

  return Project;
};