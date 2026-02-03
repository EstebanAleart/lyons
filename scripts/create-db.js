// Script para crear todas las tablas y relaciones en la base de datos
// Ejecuta: node scripts/create-db.js

const db = require('./models');

async function main() {
  try {
    await db.sequelize.authenticate();
    await db.sequelize.sync({ force: true });
    console.log('¡Base de datos creada con éxito!');
    await db.sequelize.close();
  } catch (err) {
    console.error('Error al crear la base de datos:', err);
  }
}

main();
