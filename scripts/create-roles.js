#!/usr/bin/env node
require('dotenv').config();
const { syncDatabase, sequelize } = require('../config/database');
const { Role } = require('../models');

(async () => {
  try {
    console.log('Verificando existencia de roles...');

    // Intentar crear/asegurar roles
    const ensureRoles = async () => {
      const [admin] = await Role.findOrCreate({ where: { name: 'admin' }, defaults: { name: 'admin' } });
      const [user] = await Role.findOrCreate({ where: { name: 'user' }, defaults: { name: 'user' } });
      console.log('Roles verificados/creados:', admin.name, user.name);
    };

    try {
      await ensureRoles();
      console.log('✅ Roles creados/verificados correctamente.');
      process.exit(0);
    } catch (err) {
      // Si no existe la tabla, sync y reintentar
      if (err && err.name === 'SequelizeDatabaseError' && err.parent && err.parent.code === 'ER_NO_SUCH_TABLE') {
        console.log('Tabla faltante detectada. Sincronizando base de datos...');
        await syncDatabase();
        console.log('Sincronización completada, reintentando crear roles...');
        await ensureRoles();
        console.log('✅ Roles creados/verificados después de sincronizar.');
        process.exit(0);
      }
      throw err;
    }

  } catch (error) {
    console.error('Error asegurando roles:', error);
    process.exit(1);
  }
})();
