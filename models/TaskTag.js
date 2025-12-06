module.exports = (sequelize, DataTypes) => {
  const TaskTag = sequelize.define('TaskTag', {
    task_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    tag_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    }
  }, {
    tableName: 'task_tags',
    timestamps: false
  });

  return TaskTag;
};