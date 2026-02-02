/**
 * Script de importación de datos desde Excel a PostgreSQL
 * Base de datos: lyon_db
 * Archivo: N1_-_Base_de_datos_Lyon.xlsx
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { Pool } = require('pg');

// Configuración de la base de datos desde variables de entorno
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT || 5432,
});

// Ruta al archivo Excel (en la raíz del proyecto)
const EXCEL_PATH = path.join(process.cwd(), 'N1 - Base de datos Lyon.xlsx');

/**
 * Leer archivo Excel
 */
function leerExcel(nombreHoja) {
  const workbook = XLSX.readFile(EXCEL_PATH);
  const worksheet = workbook.Sheets[nombreHoja];
  return XLSX.utils.sheet_to_json(worksheet);
}

/**
 * Insertar con manejo de duplicados
 */
async function insertarSiNoExiste(client, tabla, campos, valores, campoUnico) {
  const placeholders = valores.map((_, i) => `$${i + 1}`).join(', ');
  const query = `
    INSERT INTO ${tabla} (${campos.join(', ')})
    VALUES (${placeholders})
    ON CONFLICT (${campoUnico}) DO NOTHING
    RETURNING id
  `;
  const result = await client.query(query, valores);
  return result.rows[0]?.id;
}

/**
 * Obtener o crear registro
 */
async function obtenerOCrearId(client, tabla, campo, valor) {
  if (!valor || valor === 'NaN' || valor === '') return null;
  
  // Buscar existente
  const selectQuery = `SELECT id FROM ${tabla} WHERE ${campo} = $1`;
  let result = await client.query(selectQuery, [valor]);
  
  if (result.rows.length > 0) {
    return result.rows[0].id;
  }
  
  // Crear nuevo
  const insertQuery = `INSERT INTO ${tabla} (${campo}) VALUES ($1) RETURNING id`;
  result = await client.query(insertQuery, [valor]);
  return result.rows[0].id;
}

/**
 * 1. Cargar tablas de referencia (géneros, orígenes, canales)
 */
async function cargarTablasReferencia(client) {
  console.log('📋 Cargando tablas de referencia...');
  
  // Géneros
  const generos = [
    { codigo: 'F', descripcion: 'Femenino' },
    { codigo: 'M', descripcion: 'Masculino' },
    { codigo: 'N', descripcion: 'No especificado' },
    { codigo: 'O', descripcion: 'Otro' }
  ];
  
  for (const genero of generos) {
    await client.query(
      'INSERT INTO generos (codigo, descripcion) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [genero.codigo, genero.descripcion]
    );
  }
  console.log('  ✓ Géneros cargados');
  
  // Orígenes (basado en las hojas del Excel)
  const origenes = [
    'Leads a captar',
    'Leads a captar 2',
    'Clientes',
    'Referidos'
  ];
  
  for (const origen of origenes) {
    await client.query(
      'INSERT INTO origenes (nombre) VALUES ($1) ON CONFLICT DO NOTHING',
      [origen]
    );
  }
  console.log('  ✓ Orígenes cargados');
  
  // Canales
  const canales = ['WhatsApp', 'Llamada', 'Email', 'Presencial', 'Web'];
  
  for (const canal of canales) {
    await client.query(
      'INSERT INTO canales (nombre) VALUES ($1) ON CONFLICT DO NOTHING',
      [canal]
    );
  }
  console.log('  ✓ Canales cargados');
  
  // Estados de lead
  const estados = [
    'nuevo',
    'contactado',
    'interesado',
    'frio',
    'reactivado',
    'convertido',
    'descartado'
  ];
  
  for (const estado of estados) {
    await client.query(
      'INSERT INTO estados_lead (nombre) VALUES ($1) ON CONFLICT DO NOTHING',
      [estado]
    );
  }
  console.log('  ✓ Estados de lead cargados');
}

/**
 * 2. Cargar localidades desde el Excel
 */
async function cargarLocalidades(client) {
  console.log('🌍 Cargando localidades...');
  
  const datos = leerExcel('Datos x geografia');
  let count = 0;
  
  for (const row of datos) {
    if (row.Localidad && row.Localidad !== 'NaN') {
      await client.query(
        `INSERT INTO localidades (nombre, region, pais) 
         VALUES ($1, $2, $3) 
         ON CONFLICT DO NOTHING`,
        [row.Localidad, 'Uruguay', 'Uruguay'] // Asumo Uruguay por defecto
      );
      count++;
    }
  }
  
  console.log(`  ✓ ${count} localidades cargadas`);
}

/**
 * 3. Cargar cursos desde el Excel
 */
async function cargarCursos(client) {
  console.log('📚 Cargando cursos...');
  
  const datos = leerExcel('Datos x cursos');
  let count = 0;
  
  for (const row of datos) {
    if (row.Cursos && row.Cursos !== 'NaN') {
      await client.query(
        `INSERT INTO cursos (nombre, activo) 
         VALUES ($1, $2) 
         ON CONFLICT DO NOTHING`,
        [row.Cursos, true]
      );
      count++;
    }
  }
  
  console.log(`  ✓ ${count} cursos cargados`);
}

/**
 * 4. Cargar leads desde "Leads a captar"
 */
async function cargarLeadsACaptar(client) {
  console.log('👥 Cargando leads a captar...');
  
  const datos = leerExcel('Leads a captar');
  let count = 0;
  let errores = 0;
  
  // Obtener ID del origen
  const origenResult = await client.query(
    'SELECT id FROM origenes WHERE nombre = $1',
    ['Leads a captar']
  );
  const origenId = origenResult.rows[0]?.id;
  
  for (const row of datos) {
    try {
      // Validar que al menos tenga teléfono
      if (!row.Telefono) continue;
      
      // Obtener o crear género
      const generoId = await obtenerOCrearId(client, 'generos', 'codigo', row.Genero);
      
      // Obtener o crear localidad
      const localidadId = row.Localidad 
        ? await obtenerOCrearId(client, 'localidades', 'nombre', row.Localidad)
        : null;
      
      // Insertar lead
      const leadResult = await client.query(
        `INSERT INTO leads (nombre, apellido, telefono, email, genero_id, localidad_id, origen_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         RETURNING id`,
        [
          row.Nombre || null,
          row.Apellido || null,
          row.Telefono,
          row.Email || null,
          generoId,
          localidadId,
          origenId
        ]
      );
      
      const leadId = leadResult.rows[0].id;
      
      // Si tiene curso de interés, asociarlo
      if (row.Cursodeinteres) {
        const cursos = row.Cursodeinteres.split(/[,\/]/); // Separar por coma o slash
        
        for (let i = 0; i < cursos.length; i++) {
          const cursoNombre = cursos[i].trim();
          if (cursoNombre && cursoNombre !== 'NaN') {
            const cursoId = await obtenerOCrearId(client, 'cursos', 'nombre', cursoNombre);
            
            if (cursoId) {
              await client.query(
                `INSERT INTO lead_cursos (lead_id, curso_id, prioridad)
                 VALUES ($1, $2, $3)
                 ON CONFLICT DO NOTHING`,
                [leadId, cursoId, i + 1]
              );
            }
          }
        }
      }
      
      count++;
      
      if (count % 1000 === 0) {
        console.log(`  ... ${count} leads procesados`);
      }
      
    } catch (error) {
      errores++;
      console.error(`  ⚠️  Error en fila ${count + errores}:`, error.message);
    }
  }
  
  console.log(`  ✓ ${count} leads cargados (${errores} errores)`);
}

/**
 * 5. Cargar leads desde "Leads a captar 2"
 */
async function cargarLeadsACaptar2(client) {
  console.log('👥 Cargando leads a captar 2...');
  
  const datos = leerExcel('Leads a captar 2');
  let count = 0;
  let errores = 0;
  
  // Obtener ID del origen
  const origenResult = await client.query(
    'SELECT id FROM origenes WHERE nombre = $1',
    ['Leads a captar 2']
  );
  const origenId = origenResult.rows[0]?.id;
  
  for (const row of datos) {
    try {
      // Validar que al menos tenga teléfono
      if (!row.Telefono) continue;
      
      // Insertar lead
      await client.query(
        `INSERT INTO leads (nombre, apellido, telefono, origen_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())`,
        [
          row.Nombre || null,
          row.Apellido || null,
          row.Telefono,
          origenId
        ]
      );
      
      count++;
      
      if (count % 1000 === 0) {
        console.log(`  ... ${count} leads procesados`);
      }
      
    } catch (error) {
      errores++;
      // Silenciar errores de duplicados
      if (!error.message.includes('duplicate')) {
        console.error(`  ⚠️  Error en fila ${count + errores}:`, error.message);
      }
    }
  }
  
  console.log(`  ✓ ${count} leads cargados (${errores} duplicados/errores)`);
}

/**
 * 6. Cargar clientes
 */
async function cargarClientes(client) {
  console.log('💼 Cargando clientes...');
  
  const datos = leerExcel('Clientes');
  let count = 0;
  let errores = 0;
  
  for (const row of datos) {
    try {
      // Validar que tenga teléfono
      if (!row.Telefono) continue;
      
      // Buscar el lead por teléfono
      const leadResult = await client.query(
        'SELECT id FROM leads WHERE telefono = $1 LIMIT 1',
        [row.Telefono]
      );
      
      if (leadResult.rows.length > 0) {
        const leadId = leadResult.rows[0].id;
        
        // Insertar cliente
        await client.query(
          `INSERT INTO clientes (lead_id, fecha_alta, estado_cliente, created_at)
           VALUES ($1, NOW(), $2, NOW())
           ON CONFLICT (lead_id) DO NOTHING`,
          [leadId, 'activo']
        );
        
        count++;
      } else {
        // Si no existe el lead, crearlo primero
        const nuevoLeadResult = await client.query(
          `INSERT INTO leads (nombre, apellido, telefono, created_at, updated_at)
           VALUES ($1, $2, $3, NOW(), NOW())
           RETURNING id`,
          [row.Nombre || null, row.Apellido || null, row.Telefono]
        );
        
        const leadId = nuevoLeadResult.rows[0].id;
        
        await client.query(
          `INSERT INTO clientes (lead_id, fecha_alta, estado_cliente, created_at)
           VALUES ($1, NOW(), $2, NOW())`,
          [leadId, 'activo']
        );
        
        count++;
      }
      
      if (count % 500 === 0) {
        console.log(`  ... ${count} clientes procesados`);
      }
      
    } catch (error) {
      errores++;
      console.error(`  ⚠️  Error en fila ${count + errores}:`, error.message);
    }
  }
  
  console.log(`  ✓ ${count} clientes cargados (${errores} errores)`);
}

/**
 * Función principal
 */
async function main() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Iniciando importación de datos...\n');
    
    // Verificar que existe el archivo
    if (!fs.existsSync(EXCEL_PATH)) {
      throw new Error(`No se encuentra el archivo: ${EXCEL_PATH}`);
    }
    
    // Iniciar transacción
    await client.query('BEGIN');
    
    // 1. Tablas de referencia
    await cargarTablasReferencia(client);
    
    // 2. Localidades
    await cargarLocalidades(client);
    
    // 3. Cursos
    await cargarCursos(client);
    
    // 4. Leads a captar
    await cargarLeadsACaptar(client);
    
    // 5. Leads a captar 2
    await cargarLeadsACaptar2(client);
    
    // 6. Clientes
    await cargarClientes(client);
    
    // Confirmar transacción
    await client.query('COMMIT');
    
    console.log('\n✅ Importación completada exitosamente!');
    
    // Mostrar estadísticas
    console.log('\n📊 Estadísticas:');
    const stats = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM leads) as total_leads,
        (SELECT COUNT(*) FROM clientes) as total_clientes,
        (SELECT COUNT(*) FROM localidades) as total_localidades,
        (SELECT COUNT(*) FROM cursos) as total_cursos,
        (SELECT COUNT(*) FROM lead_cursos) as total_lead_cursos
    `);
    
    const { total_leads, total_clientes, total_localidades, total_cursos, total_lead_cursos } = stats.rows[0];
    console.log(`  • Leads: ${total_leads}`);
    console.log(`  • Clientes: ${total_clientes}`);
    console.log(`  • Localidades: ${total_localidades}`);
    console.log(`  • Cursos: ${total_cursos}`);
    console.log(`  • Relaciones Lead-Curso: ${total_lead_cursos}`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Error durante la importación:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar
main().catch(console.error);