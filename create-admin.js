const bcrypt = require('bcryptjs');
const { sequelize, User, Role } = require('./models');

async function createAdmin() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente');

    // Buscar o crear el rol admin
    const [adminRole] = await Role.findOrCreate({
      where: { name: 'admin' },
      defaults: { name: 'admin' }
    });

    console.log('✅ Rol admin verificado');

    // Verificar si ya existe un usuario admin
    const existingAdmin = await User.findOne({
      where: { email: 'admin@taskmanager.com' }
    });

    if (existingAdmin) {
      console.log('⚠️  Ya existe un usuario administrador con el email admin@taskmanager.com');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Username:', existingAdmin.username);
      console.log('\n💡 Si olvidaste la contraseña, puedes eliminar este usuario de la base de datos y ejecutar el script nuevamente');
      await sequelize.close();
      return;
    }

    // Hash de la contraseña
    const password = 'admin123'; // Contraseña por defecto
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear el usuario admin
    const admin = await User.create({
      username: 'admin',
      email: 'admin@taskmanager.com',
      password: hashedPassword,
      role_id: adminRole.id
    });

    console.log('\n✅ ¡Usuario administrador creado exitosamente!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    admin@taskmanager.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Username: admin');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  IMPORTANTE: Cambia la contraseña después del primer inicio de sesión\n');

    await sequelize.close();
    console.log('✅ Conexión cerrada');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error al crear usuario administrador:', error);
    await sequelize.close();
    process.exit(1);
  }
}

// Ejecutar la función
createAdmin();
