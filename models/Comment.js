module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    task_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'comments',
    timestamps: false
  });

  Comment.associate = function(models) {
    // Pertenece a una tarea
    Comment.belongsTo(models.Task, {
      foreignKey: 'task_id',
      as: 'task'
    });

    // Pertenece a un usuario
    Comment.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return Comment;
};