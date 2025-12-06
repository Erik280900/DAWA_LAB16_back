module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2 // Usuario normal por defecto
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'users',
    timestamps: false
  });

  User.associate = function(models) {
    // Pertenece a un rol
    User.belongsTo(models.Role, {
      foreignKey: 'role_id',
      as: 'role'
    });

    // Puede tener muchos proyectos personales
    User.hasMany(models.Project, {
      foreignKey: 'user_id',
      as: 'projects'
    });

    // Puede hacer muchos comentarios
    User.hasMany(models.Comment, {
      foreignKey: 'user_id',
      as: 'comments'
    });
  };

  return User;
};