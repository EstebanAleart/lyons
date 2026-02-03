// scripts/createTables.js
// Crear todas las tablas con UUID

require('dotenv').config({ path: '.env.local' });
const { sequelize } = require('../lib/models');

async function createTables() {
  try {
    console.log('🔄 Creando extensión uuid-ossp...');
    await sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    console.log('✓ Extensión creada');

    console.log('🔄 Sincronizando modelos (force: true)...');
    await sequelize.sync({ force: true });
    console.log('✅ Tablas creadas con UUID!');
    
    // Verificar
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.log('\nTablas creadas:', tables.map(t => t.table_name).join(', '));
    
    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
}

createTables();
