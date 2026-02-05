/**
 * Script de importación INCREMENTAL desde Excel a PostgreSQL
 * Solo importa registros nuevos, evitando duplicados
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

// Ruta al archivo Excel (en la raíz del proyecto)
const EXCEL_PATH = path.join(process.cwd(), 'N1 - Base de datos Lyon.xlsx');

// Estadísticas globales
const stats = {
  leads_nuevos: 0,
  leads_duplicados: 0,
  clientes_nuevos: 0,
  clientes_duplicados: 0,
  errores: 0
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
 * Limpiar teléfono (solo convertir a string y trim, sin modificar formato)
 */
function limpiarTelefono(telefono) {
  if (!telefono) return null;
  const tel = String(telefono).trim();
  return tel === '' || tel === 'NaN' ? null : tel;
}

/**
 * Verificar si un teléfono ya existe en la BD
 */
async function telefonoExiste(client, telefono) {
  const tel = limpiarTelefono(telefono);
  if (!tel) return false;
  
  const result = await client.query(
    'SELECT id FROM leads WHERE telefono = $1 LIMIT 1',
    [tel]
  );
  
  return result.rows.length > 0;
}

/**
 * Obtener o crear ID de referencia
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
 * Insertar lead solo si no existe (basado en teléfono)
 */
async function insertarLeadSiNoExiste(client, leadData) {
  const tel = limpiarTelefono(leadData.telefono);
  
  if (!tel) {
    return { insertado: false, motivo: 'sin_telefono' };
  }
  
  // Verificar si ya existe
  const existe = await telefonoExiste(client, tel);
  
  if (existe) {
    stats.leads_duplicados++;
    return { insertado: false, motivo: 'duplicado' };
  }
  
  try {
    // Insertar nuevo lead
    const result = await client.query(
      `INSERT INTO leads (nombre, apellido, telefono, email, genero_id, localidad_id, origen_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING id`,
      [
        leadData.nombre || null,
        leadData.apellido || null,
        tel,
        leadData.email || null,
        leadData.genero_id || null,
        leadData.localidad_id || null,
        leadData.origen_id || null
      ]
    );
    
    stats.leads_nuevos++;
    return { insertado: true, leadId: result.rows[0].id };
    
  } catch (error) {
    stats.errores++;
    console.error(`  ⚠️  Error insertando lead ${tel}:`, error.message);
    return { insertado: false, motivo: 'error' };
  }
}

/**
 * Asociar cursos a un lead
 */
async function asociarCursos(client, leadId, cursosString) {
  if (!cursosString || cursosString === 'NaN') return;
  
  const cursos = cursosString.split(/[,\/]/); // Separar por coma o slash
  
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
        console.error(`    ⚠️  Error asociando curso ${cursoNombre}:`, error.message);
      }
    }
  }
}

/**
 * Cargar leads desde "Leads a captar"
 */
async function cargarLeadsACaptar(client) {
  console.log('\n👥 Procesando "Leads a captar"...');
  
  const datos = leerExcel('Leads a captar');
  
  // Obtener ID del origen
  const origenResult = await client.query(
    'SELECT id FROM origenes WHERE nombre = $1',
    ['Leads a captar']
  );
  const origenId = origenResult.rows[0]?.id;
  
  let procesados = 0;
  
  for (const row of datos) {
    // Preparar datos del lead
    const generoId = row.Genero ? await obtenerOCrearId(client, 'generos', 'codigo', row.Genero) : null;
    const localidadId = row.Localidad ? await obtenerOCrearId(client, 'localidades', 'nombre', row.Localidad) : null;
    
    const leadData = {
      nombre: row.Nombre,
      apellido: row.Apellido,
      telefono: row.Telefono,
      email: row.Email,
      genero_id: generoId,
      localidad_id: localidadId,
      origen_id: origenId
    };
    
    const resultado = await insertarLeadSiNoExiste(client, leadData);
    
    // Si se insertó y tiene cursos, asociarlos
    if (resultado.insertado && row.Cursodeinteres) {
      await asociarCursos(client, resultado.leadId, row.Cursodeinteres);
    }
    
    procesados++;
    if (procesados % 1000 === 0) {
      console.log(`  ... ${procesados}/${datos.length} procesados (${stats.leads_nuevos} nuevos, ${stats.leads_duplicados} duplicados)`);
    }
  }
  
  console.log(`  ✓ Completado: ${stats.leads_nuevos} nuevos, ${stats.leads_duplicados} duplicados de ${datos.length} registros`);
}

/**
 * Cargar leads desde "Leads a captar 2"
 */
async function cargarLeadsACaptar2(client) {
  console.log('\n👥 Procesando "Leads a captar 2"...');
  
  const datos = leerExcel('Leads a captar 2');
  
  // Obtener ID del origen
  const origenResult = await client.query(
    'SELECT id FROM origenes WHERE nombre = $1',
    ['Leads a captar 2']
  );
  const origenId = origenResult.rows[0]?.id;
  
  const nuevosAntes = stats.leads_nuevos;
  const duplicadosAntes = stats.leads_duplicados;
  let procesados = 0;
  
  for (const row of datos) {
    // Nota: En esta hoja, "Localidad" parece contener teléfonos según el ejemplo
    // Ajustar según la estructura real
    const localidadId = row.Localidad && !String(row.Localidad).match(/^\d+$/) 
      ? await obtenerOCrearId(client, 'localidades', 'nombre', row.Localidad) 
      : null;
    
    const leadData = {
      nombre: row.Nombre,
      apellido: row.Apellido,
      telefono: row.Telefono,
      localidad_id: localidadId,
      origen_id: origenId
    };
    
    await insertarLeadSiNoExiste(client, leadData);
    
    procesados++;
    if (procesados % 1000 === 0) {
      const nuevosEsta = stats.leads_nuevos - nuevosAntes;
      const dupsEsta = stats.leads_duplicados - duplicadosAntes;
      console.log(`  ... ${procesados}/${datos.length} procesados (${nuevosEsta} nuevos, ${dupsEsta} duplicados)`);
    }
  }
  
  const nuevosEsta = stats.leads_nuevos - nuevosAntes;
  const dupsEsta = stats.leads_duplicados - duplicadosAntes;
  console.log(`  ✓ Completado: ${nuevosEsta} nuevos, ${dupsEsta} duplicados de ${datos.length} registros`);
}

/**
 * Cargar clientes
 */
async function cargarClientes(client) {
  console.log('\n💼 Procesando "Clientes"...');
  
  const datos = leerExcel('Clientes');
  let procesados = 0;
  
  for (const row of datos) {
    const tel = limpiarTelefono(row.TELEFONO);
    
    if (!tel) continue;
    
    try {
      // Buscar el lead por teléfono
      const leadResult = await client.query(
        'SELECT id FROM leads WHERE telefono = $1 LIMIT 1',
        [tel]
      );
      
      let leadId;
      
      if (leadResult.rows.length > 0) {
        leadId = leadResult.rows[0].id;
      } else {
        // Si no existe el lead, crearlo primero
        const nuevoLeadResult = await client.query(
          `INSERT INTO leads (nombre, apellido, telefono, created_at, updated_at)
           VALUES ($1, $2, $3, NOW(), NOW())
           RETURNING id`,
          [row.NOMBRE || null, row.APELLIDO || null, tel]
        );
        
        leadId = nuevoLeadResult.rows[0].id;
        stats.leads_nuevos++;
      }
      
      // Verificar si ya es cliente
      const clienteExiste = await client.query(
        'SELECT id FROM clientes WHERE lead_id = $1',
        [leadId]
      );
      
      if (clienteExiste.rows.length === 0) {
        // Insertar como cliente
        await client.query(
          `INSERT INTO clientes (lead_id, fecha_alta, estado_cliente, created_at)
           VALUES ($1, NOW(), $2, NOW())`,
          [leadId, 'activo']
        );
        
        stats.clientes_nuevos++;
      } else {
        stats.clientes_duplicados++;
      }
      
      procesados++;
      if (procesados % 500 === 0) {
        console.log(`  ... ${procesados}/${datos.length} procesados (${stats.clientes_nuevos} nuevos clientes)`);
      }
      
    } catch (error) {
      stats.errores++;
      console.error(`  ⚠️  Error procesando cliente ${tel}:`, error.message);
    }
  }
  
  console.log(`  ✓ Completado: ${stats.clientes_nuevos} nuevos, ${stats.clientes_duplicados} ya existían de ${datos.length} registros`);
}

/**
 * Función principal
 */
async function main() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Iniciando importación INCREMENTAL...\n');
    console.log('⚡ Solo se importarán registros nuevos (sin duplicar)\n');
    
    // Verificar que existe el archivo
    if (!fs.existsSync(EXCEL_PATH)) {
      throw new Error(`No se encuentra el archivo: ${EXCEL_PATH}`);
    }
    
    // Mostrar estado inicial
    console.log('📊 Estado ANTES de la importación:');
    const statsAntes = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM leads) as total_leads,
        (SELECT COUNT(*) FROM clientes) as total_clientes
    `);
    console.log(`  • Leads en BD: ${statsAntes.rows[0].total_leads}`);
    console.log(`  • Clientes en BD: ${statsAntes.rows[0].total_clientes}`);
    
    // Iniciar transacción
    await client.query('BEGIN');
    
    // Procesar cada hoja
    await cargarLeadsACaptar(client);
    await cargarLeadsACaptar2(client);
    await cargarClientes(client);
    
    // Confirmar transacción
    await client.query('COMMIT');
    
    console.log('\n✅ Importación completada exitosamente!');
    
    // Mostrar estadísticas finales
    console.log('\n📊 Estado DESPUÉS de la importación:');
    const statsDespues = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM leads) as total_leads,
        (SELECT COUNT(*) FROM clientes) as total_clientes,
        (SELECT COUNT(*) FROM localidades) as total_localidades,
        (SELECT COUNT(*) FROM cursos) as total_cursos,
        (SELECT COUNT(*) FROM lead_cursos) as total_lead_cursos
    `);
    
    console.log(`  • Leads en BD: ${statsDespues.rows[0].total_leads} (antes: ${statsAntes.rows[0].total_leads})`);
    console.log(`  • Clientes en BD: ${statsDespues.rows[0].total_clientes} (antes: ${statsAntes.rows[0].total_clientes})`);
    console.log(`  • Localidades: ${statsDespues.rows[0].total_localidades}`);
    console.log(`  • Cursos: ${statsDespues.rows[0].total_cursos}`);
    console.log(`  • Relaciones Lead-Curso: ${statsDespues.rows[0].total_lead_cursos}`);
    
    console.log('\n📈 Resumen de la importación:');
    console.log(`  • Leads nuevos insertados: ${stats.leads_nuevos}`);
    console.log(`  • Leads duplicados (omitidos): ${stats.leads_duplicados}`);
    console.log(`  • Clientes nuevos: ${stats.clientes_nuevos}`);
    console.log(`  • Clientes duplicados (omitidos): ${stats.clientes_duplicados}`);
    console.log(`  • Errores: ${stats.errores}`);
    
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
