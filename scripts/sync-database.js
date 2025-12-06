#!/usr/bin/env node
require('dotenv').config();
const { syncDatabase } = require('../config/database');

(async () => {
  try {
    console.log('Iniciando sincronización de la base de datos (alter)...');
    await syncDatabase();
    console.log('Sincronización completada.');
    process.exit(0);
  } catch (err) {
    console.error('Error sincronizando la base de datos:', err);
    process.exit(1);
  }
})();
