const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

// Función para generar JWT
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Registro de usuario
const register = async (req, res) => {
  try {
    const { username, email, password, role_id = 2 } = req.body;

    // Validaciones básicas
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email y password son requeridos'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Hashear contraseña
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear usuario
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role_id
    });

    // Buscar usuario con rol para respuesta
    const userWithRole = await User.findByPk(newUser.id, {
      include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
      attributes: { exclude: ['password'] }
    });

    // Generar token
    const token = generateToken(newUser.id);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: userWithRole,
        token
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Login de usuario
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y password son requeridos'
      });
    }

    // Buscar usuario por email
    const user = await User.findOne({ where: { email }, include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }] });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Generar token
    const token = generateToken(user.id);

    // Remover password de la respuesta
    const userResponse = { ...user.toJSON() };
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: userResponse,
        token
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener perfil del usuario autenticado
const getProfile = async (req, res) => {
  try {
    const user = req.user;

    res.json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar perfil
const updateProfile = async (req, res) => {
  try {
    const { username, email } = req.body;
    const userId = req.user.id;

    // Validar que no esté vacío
    if (!username && !email) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere al menos un campo para actualizar'
      });
    }

    // Si se está actualizando el email, verificar que no exista
    if (email) {
      const existingUser = await User.findOne({
        where: { 
          email,
          id: { [require('sequelize').Op.ne]: userId } // Excluir el usuario actual
        }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'El email ya está en uso por otro usuario'
        });
      }
    }

    // Actualizar usuario
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;

    await User.update(updateData, {
      where: { id: userId }
    });

    // Obtener usuario actualizado
    const updatedUser = await User.findByPk(userId, { include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }], attributes: { exclude: ['password'] } });

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        user: updatedUser
      }
    });

  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Cambiar contraseña
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validaciones
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Contraseña actual y nueva contraseña son requeridas'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña debe tener al menos 6 caracteres'
      });
    }

    // Buscar usuario con contraseña
    const user = await User.findByPk(userId);

    // Verificar contraseña actual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Contraseña actual incorrecta'
      });
    }

    // Hashear nueva contraseña
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Actualizar contraseña
    await User.update(
      { password: hashedNewPassword },
      { where: { id: userId } }
    );

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
};