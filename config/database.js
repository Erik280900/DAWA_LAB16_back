const { Sequelize } = require('sequelize');
require('dotenv').config();

// Read env vars with fallbacks. Some providers use DB_PASSWORD instead of DB_PASS.
const DB_NAME = process.env.DB_NAME || 'trabajo_dawa';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || process.env.DB_PASSWORD || '';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;

// Common Sequelize options
const commonOptions = {
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  timezone: '-06:00'
};

let sequelize;

// If a full connection URL is provided (e.g. from Railway/Render), prefer it.
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    ...commonOptions,
    // Allow opting into insecure SSL when required by some providers (set DB_SSL=true)
    dialectOptions: process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: false } } : {}
  });
} else {
  sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
    host: DB_HOST,
    port: DB_PORT,
    ...commonOptions
  });
}

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
