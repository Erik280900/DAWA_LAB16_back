const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'trabajo_dawa',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    timezone: '-06:00'
  }
);

// Probar la conexión
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a MySQL establecida correctamente.');
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    process.exit(1);
  }
};

// Sincronizar la base de datos
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Base de datos sincronizada correctamente.');
  } catch (error) {
    console.error('❌ Error al sincronizar la base de datos:', error);
    throw error;
  }
};

module.exports = { sequelize, testConnection, syncDatabase };
