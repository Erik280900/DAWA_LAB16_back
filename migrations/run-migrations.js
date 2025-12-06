const { sequelize } = require('../config/database');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos.');

    // Consultar el tipo actual de la columna status
    const [results] = await sequelize.query(
      `SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tasks' AND COLUMN_NAME = 'status'`
    );

    if (!results || results.length === 0) {
      console.error('No se pudo obtener información de la columna `status` en `tasks`.');
      process.exit(1);
    }

    const columnType = results[0].COLUMN_TYPE; // e.g. "enum('pending','in_progress','completed')"
    console.log('Tipo actual de la columna status:', columnType);

    if (columnType.includes("'review'")) {
      console.log("La columna ya incluye 'review'. No se requiere acción.");
      process.exit(0);
    }

    // Ejecutar ALTER para añadir 'review'
    const alterSql = "ALTER TABLE tasks MODIFY COLUMN status ENUM('pending','in_progress','review','completed') DEFAULT 'pending'";
    console.log('Ejecutando:', alterSql);
    await sequelize.query(alterSql);

    console.log("✅ Migración completada: 'review' añadido a tasks.status");
    process.exit(0);
  } catch (error) {
    console.error('Error ejecutando migración:', error);
    process.exit(1);
  }
})();
