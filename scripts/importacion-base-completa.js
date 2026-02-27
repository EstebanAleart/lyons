/**
 * Script de importación desde "BASE COMPLETA"
 * Importa todos los registros de la hoja consolidada evitando duplicados
 * Base de datos: lyon_db
 * Archivo: N1_-_Base_de_datos_Lyon.xlsx
 */

require('dotenv').config({ path: '.env.local' });

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
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Ruta al archivo Excel
const EXCEL_PATH = path.join(process.cwd(), 'N1 - Base de datos Lyon.xlsx');

// Estadísticas
const stats = {
  procesados: 0,
  nuevos: 0,
  duplicados: 0,
  errores: 0,
  sin_telefono: 0
};

/**
 * Leer archivo Excel
 */
function leerExcel(nombreHoja) {
  const workbook = XLSX.readFile(EXCEL_PATH);
  const worksheet = workbook.Sheets[nombreHoja];
  return XLSX.utils.sheet_to_json(worksheet);
}

/**
 * Normalizar teléfono
 */
function normalizarTelefono(telefono) {
  if (!telefono) return null;
  return String(telefono)
    .replace(/\s+/g, '')
    .replace(/-/g, '')
    .replace(/\(/g, '')
    .replace(/\)/g, '')
    .trim();
}

/**
 * Obtener o crear ID de referencia
 */
async function obtenerOCrearId(client, tabla, campo, valor) {
  if (!valor || valor === 'NaN' || valor === '') return null;
  
  try {
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
  } catch (error) {
    console.error(`    ⚠️  Error en obtenerOCrearId(${tabla}, ${campo}, ${valor}):`, error.message);
    return null;
  }
}

/**
 * Asociar cursos a un lead
 */
async function asociarCursos(client, leadId, cursosString) {
  if (!cursosString || cursosString === 'NaN') return;
  
  const cursos = cursosString.split(/[,\/]/);
  
  for (let i = 0; i < cursos.length; i++) {
    const cursoNombre = cursos[i].trim();
    
    if (cursoNombre && cursoNombre !== 'NaN') {
      try {
        const cursoId = await obtenerOCrearId(client, 'cursos', 'nombre', cursoNombre);
        
        if (cursoId) {
          await client.query(
            `INSERT INTO lead_cursos (lead_id, curso_id, prioridad)
             VALUES ($1, $2, $3)
             ON CONFLICT DO NOTHING`,
            [leadId, cursoId, i + 1]
          );
        }
      } catch (error) {
        // Silenciar errores de cursos para no saturar el log
      }
    }
  }
}

/**
 * Procesar BASE COMPLETA
 */
async function procesarBaseCompleta(client) {
  console.log('📊 Procesando "BASE COMPLETA"...\n');
  
  const datos = leerExcel('BASE COMPLETA');
  console.log(`Total de registros a procesar: ${datos.length}`);
  
  // Obtener origen por defecto
  let origenId = null;
  try {
    const origenResult = await client.query(
      'SELECT id FROM origenes WHERE nombre = $1',
      ['Base completa']
    );
    
    if (origenResult.rows.length === 0) {
      const insertResult = await client.query(
        'INSERT INTO origenes (nombre) VALUES ($1) RETURNING id',
        ['Base completa']
      );
      origenId = insertResult.rows[0].id;
    } else {
      origenId = origenResult.rows[0].id;
    }
  } catch (error) {
    console.error('Error obteniendo origen:', error.message);
  }
  
  // Procesar en lotes para mejor performance
  const BATCH_SIZE = 500;
  
  for (let i = 0; i < datos.length; i++) {
    const row = datos[i];
    
    try {
      const tel = normalizarTelefono(row.Telefono);
      
      if (!tel) {
        stats.sin_telefono++;
        stats.procesados++;
        continue;
      }
      
      // Verificar si ya existe el lead
      const existeResult = await client.query(
        'SELECT id FROM leads WHERE telefono = $1 LIMIT 1',
        [tel]
      );
      
      let leadId;
      
      if (existeResult.rows.length > 0) {
        // Ya existe
        leadId = existeResult.rows[0].id;
        stats.duplicados++;
      } else {
        // Crear nuevo lead
        const generoId = row.Genero ? await obtenerOCrearId(client, 'generos', 'codigo', row.Genero) : null;
        const localidadId = row.Localidad ? await obtenerOCrearId(client, 'localidades', 'nombre', row.Localidad) : null;
        
        const insertResult = await client.query(
          `INSERT INTO leads (nombre, apellido, telefono, email, genero_id, localidad_id, origen_id, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
           RETURNING id`,
          [
            row.Nombre || null,
            row.Apellido || null,
            tel,
            row.Email || null,
            generoId,
            localidadId,
            origenId
          ]
        );
        
        leadId = insertResult.rows[0].id;
        stats.nuevos++;
        
        // Asociar cursos si tiene
        if (row.Cursodeinteres) {
          await asociarCursos(client, leadId, row.Cursodeinteres);
        }
      }
      
      stats.procesados++;
      
      // Progreso cada BATCH_SIZE registros
      if (stats.procesados % BATCH_SIZE === 0) {
        const porcentaje = ((stats.procesados / datos.length) * 100).toFixed(1);
        console.log(`  ${porcentaje}% - ${stats.procesados}/${datos.length} | Nuevos: ${stats.nuevos} | Duplicados: ${stats.duplicados} | Errores: ${stats.errores}`);
      }
      
    } catch (error) {
      stats.errores++;
      if (stats.errores <= 10) { // Solo mostrar los primeros 10 errores
        console.error(`  ⚠️  Error en registro ${stats.procesados}:`, error.message);
      }
    }
  }
  
  console.log('\n✓ Procesamiento completado');
}

/**
 * Función principal
 */
async function main() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Importación desde BASE COMPLETA\n');
    console.log('=' .repeat(60));
    
    // Verificar archivo
    if (!fs.existsSync(EXCEL_PATH)) {
      throw new Error(`No se encuentra el archivo: ${EXCEL_PATH}`);
    }
    
    // Estado inicial
    console.log('\n📊 Estado inicial de la base de datos:');
    const statsInicial = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM leads) as total_leads,
        (SELECT COUNT(*) FROM clientes) as total_clientes
    `);
    console.log(`  • Leads: ${statsInicial.rows[0].total_leads}`);
    console.log(`  • Clientes: ${statsInicial.rows[0].total_clientes}`);
    console.log('');
    
    // Iniciar transacción
    await client.query('BEGIN');
    
    const startTime = Date.now();
    
    // Procesar
    await procesarBaseCompleta(client);
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    // Confirmar transacción
    await client.query('COMMIT');
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Importación completada exitosamente!\n');
    
    // Estado final
    console.log('📊 Estado final de la base de datos:');
    const statsFinal = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM leads) as total_leads,
        (SELECT COUNT(*) FROM clientes) as total_clientes,
        (SELECT COUNT(*) FROM localidades) as total_localidades,
        (SELECT COUNT(*) FROM cursos) as total_cursos,
        (SELECT COUNT(*) FROM lead_cursos) as total_lead_cursos
    `);
    
    console.log(`  • Leads: ${statsFinal.rows[0].total_leads} (antes: ${statsInicial.rows[0].total_leads})`);
    console.log(`  • Clientes: ${statsFinal.rows[0].total_clientes}`);
    console.log(`  • Localidades: ${statsFinal.rows[0].total_localidades}`);
    console.log(`  • Cursos: ${statsFinal.rows[0].total_cursos}`);
    console.log(`  • Relaciones Lead-Curso: ${statsFinal.rows[0].total_lead_cursos}`);
    
    console.log('\n📈 Resumen de la operación:');
    console.log(`  • Registros procesados: ${stats.procesados}`);
    console.log(`  • Leads nuevos insertados: ${stats.nuevos}`);
    console.log(`  • Leads duplicados (omitidos): ${stats.duplicados}`);
    console.log(`  • Registros sin teléfono: ${stats.sin_telefono}`);
    console.log(`  • Errores: ${stats.errores}`);
    console.log(`  • Tiempo de ejecución: ${duration} segundos`);
    
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
