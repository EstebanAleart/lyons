// scripts/migrateToUUID.js
// Migración de todas las tablas a UUID

require('dotenv').config({ path: '.env.local' });
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false
});

async function migrate() {
  console.log('🔄 Iniciando migración a UUID...\n');
  
  try {
    // Habilitar extensión uuid-ossp si no existe
    await sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    console.log('✓ Extensión uuid-ossp habilitada');

    // Orden de migración (primero tablas sin FK, luego con FK)
    const migrations = [
      // Tablas base (sin foreign keys)
      {
        table: 'generos',
        fkRefs: []
      },
      {
        table: 'localidades',
        fkRefs: []
      },
      {
        table: 'origenes',
        fkRefs: []
      },
      {
        table: 'canales',
        fkRefs: []
      },
      {
        table: 'cursos',
        fkRefs: []
      },
      {
        table: 'estados_lead',
        fkRefs: []
      },
      {
        table: 'usuarios',
        fkRefs: []
      },
      // Tabla leads (tiene FK a generos, localidades, origenes)
      {
        table: 'leads',
        fkRefs: [
          { column: 'genero_id', refTable: 'generos' },
          { column: 'localidad_id', refTable: 'localidades' },
          { column: 'origen_id', refTable: 'origenes' },
        ]
      },
      // Tablas con FK a leads
      {
        table: 'clientes',
        fkRefs: [
          { column: 'lead_id', refTable: 'leads' }
        ]
      },
      {
        table: 'interacciones',
        fkRefs: [
          { column: 'lead_id', refTable: 'leads' },
          { column: 'usuario_id', refTable: 'usuarios' },
          { column: 'canal_id', refTable: 'canales' }
        ]
      },
      {
        table: 'historial_estado_lead',
        fkRefs: [
          { column: 'lead_id', refTable: 'leads' },
          { column: 'estado_id', refTable: 'estados_lead' }
        ]
      },
      {
        table: 'lead_cursos',
        fkRefs: [
          { column: 'lead_id', refTable: 'leads' },
          { column: 'curso_id', refTable: 'cursos' }
        ]
      }
    ];

    // Primero, eliminar todas las foreign keys
    console.log('\n📋 Eliminando foreign keys...');
    for (const m of migrations) {
      for (const fk of m.fkRefs) {
        const constraintName = `${m.table}_${fk.column}_fkey`;
        try {
          await sequelize.query(`ALTER TABLE ${m.table} DROP CONSTRAINT IF EXISTS ${constraintName};`);
        } catch (e) {
          // Ignorar si no existe
        }
      }
    }
    console.log('✓ Foreign keys eliminadas');

    // Migrar cada tabla
    for (const m of migrations) {
      console.log(`\n🔄 Migrando tabla: ${m.table}`);
      
      // Verificar si la tabla existe
      const [tables] = await sequelize.query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = '${m.table}'
      `);
      
      if (tables.length === 0) {
        console.log(`  ⚠ Tabla ${m.table} no existe, saltando...`);
        continue;
      }

      // Verificar tipo actual de la columna id
      const [columns] = await sequelize.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = '${m.table}' AND column_name = 'id'
      `);

      if (columns.length === 0) {
        console.log(`  ⚠ Tabla ${m.table} no tiene columna id, saltando...`);
        continue;
      }

      if (columns[0].data_type === 'uuid') {
        console.log(`  ✓ Ya está en UUID`);
        continue;
      }

      // Crear columna temporal UUID
      await sequelize.query(`ALTER TABLE ${m.table} ADD COLUMN IF NOT EXISTS new_id UUID DEFAULT uuid_generate_v4();`);
      
      // Actualizar new_id para registros existentes
      await sequelize.query(`UPDATE ${m.table} SET new_id = uuid_generate_v4() WHERE new_id IS NULL;`);
      
      // Crear mapeo de id viejo a nuevo
      const [oldIds] = await sequelize.query(`SELECT id, new_id FROM ${m.table};`);
      const idMap = {};
      oldIds.forEach(row => { idMap[row.id] = row.new_id; });
      
      // Guardar el mapeo para las FK
      m.idMap = idMap;

      // Eliminar PK vieja
      await sequelize.query(`ALTER TABLE ${m.table} DROP CONSTRAINT IF EXISTS ${m.table}_pkey;`);
      
      // Eliminar columna id vieja
      await sequelize.query(`ALTER TABLE ${m.table} DROP COLUMN id;`);
      
      // Renombrar new_id a id
      await sequelize.query(`ALTER TABLE ${m.table} RENAME COLUMN new_id TO id;`);
      
      // Agregar PK
      await sequelize.query(`ALTER TABLE ${m.table} ADD PRIMARY KEY (id);`);
      
      // Establecer default
      await sequelize.query(`ALTER TABLE ${m.table} ALTER COLUMN id SET DEFAULT uuid_generate_v4();`);
      
      console.log(`  ✓ Columna id migrada a UUID`);
    }

    // Actualizar foreign keys
    console.log('\n📋 Actualizando columnas de foreign keys...');
    
    for (const m of migrations) {
      for (const fk of m.fkRefs) {
        // Encontrar el mapeo de la tabla referenciada
        const refMigration = migrations.find(x => x.table === fk.refTable);
        if (!refMigration || !refMigration.idMap) continue;
        
        // Verificar si la columna existe
        const [cols] = await sequelize.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = '${m.table}' AND column_name = '${fk.column}'
        `);
        
        if (cols.length === 0) continue;
        if (cols[0].data_type === 'uuid') {
          console.log(`  ✓ ${m.table}.${fk.column} ya es UUID`);
          continue;
        }

        console.log(`  🔄 Actualizando ${m.table}.${fk.column}...`);
        
        // Agregar columna UUID temporal
        await sequelize.query(`ALTER TABLE ${m.table} ADD COLUMN IF NOT EXISTS ${fk.column}_new UUID;`);
        
        // Actualizar con los nuevos UUIDs usando el mapeo
        for (const [oldId, newId] of Object.entries(refMigration.idMap)) {
          await sequelize.query(`UPDATE ${m.table} SET ${fk.column}_new = '${newId}' WHERE ${fk.column} = ${oldId};`);
        }
        
        // Eliminar columna vieja
        await sequelize.query(`ALTER TABLE ${m.table} DROP COLUMN ${fk.column};`);
        
        // Renombrar
        await sequelize.query(`ALTER TABLE ${m.table} RENAME COLUMN ${fk.column}_new TO ${fk.column};`);
        
        console.log(`  ✓ ${m.table}.${fk.column} migrada`);
      }
    }

    // Recrear foreign keys
    console.log('\n📋 Recreando foreign keys...');
    for (const m of migrations) {
      for (const fk of m.fkRefs) {
        try {
          await sequelize.query(`
            ALTER TABLE ${m.table} 
            ADD CONSTRAINT ${m.table}_${fk.column}_fkey 
            FOREIGN KEY (${fk.column}) 
            REFERENCES ${fk.refTable}(id) 
            ON DELETE SET NULL;
          `);
          console.log(`  ✓ FK ${m.table}.${fk.column} -> ${fk.refTable}`);
        } catch (e) {
          console.log(`  ⚠ No se pudo crear FK ${m.table}.${fk.column}: ${e.message}`);
        }
      }
    }

    console.log('\n✅ Migración completada!');
    
  } catch (error) {
    console.error('❌ Error en migración:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

migrate();
