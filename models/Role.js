module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false
    }
  }, {
    tableName: 'roles',
    timestamps: false
  });

  Role.associate = function(models) {
    // Un rol puede tener muchos usuarios
    Role.hasMany(models.User, {
      foreignKey: 'role_id',
      as: 'users'
    });
  };

  return Role;
};