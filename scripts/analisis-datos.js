/**
 * Script de validación y análisis de datos
 * Compara Excel vs Base de Datos para detectar qué falta importar
 */

require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: parseInt(process.env.DB_PORT || '5432'),
});

const EXCEL_PATH = path.join(process.cwd(), 'N1 - Base de datos Lyon.xlsx');

/**
 * Leer Excel
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
 * Análisis principal
 */
async function analizarDatos() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 ANÁLISIS DE DATOS - Excel vs Base de Datos\n');
    console.log('='.repeat(70));
    
    // 1. Estado actual de la BD
    console.log('\n📊 ESTADO ACTUAL DE LA BASE DE DATOS:');
    console.log('-'.repeat(70));
    
    const statsDB = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM leads) as total_leads,
        (SELECT COUNT(DISTINCT telefono) FROM leads WHERE telefono IS NOT NULL) as leads_con_telefono,
        (SELECT COUNT(*) FROM leads WHERE telefono IS NULL) as leads_sin_telefono,
        (SELECT COUNT(*) FROM clientes) as total_clientes,
        (SELECT COUNT(*) FROM localidades) as total_localidades,
        (SELECT COUNT(*) FROM cursos) as total_cursos,
        (SELECT COUNT(*) FROM generos) as total_generos,
        (SELECT COUNT(*) FROM origenes) as total_origenes,
        (SELECT COUNT(*) FROM lead_cursos) as total_lead_cursos
    `);
    
    const stats = statsDB.rows[0];
    console.log(`  • Leads totales: ${stats.total_leads}`);
    console.log(`  • Leads con teléfono único: ${stats.leads_con_telefono}`);
    console.log(`  • Leads sin teléfono: ${stats.leads_sin_telefono}`);
    console.log(`  • Clientes: ${stats.total_clientes}`);
    console.log(`  • Localidades: ${stats.total_localidades}`);
    console.log(`  • Cursos: ${stats.total_cursos}`);
    console.log(`  • Géneros: ${stats.total_generos}`);
    console.log(`  • Orígenes: ${stats.total_origenes}`);
    console.log(`  • Relaciones Lead-Curso: ${stats.total_lead_cursos}`);
    
    // 2. Análisis del Excel
    console.log('\n\n📄 ANÁLISIS DEL ARCHIVO EXCEL:');
    console.log('-'.repeat(70));
    
    const hojas = ['Leads a captar', 'Leads a captar 2', 'Clientes', 'BASE COMPLETA'];
    const analisisExcel = {};
    
    for (const hoja of hojas) {
      try {
        const datos = leerExcel(hoja);
        
        // Contar teléfonos válidos
        let conTelefono = 0;
        let sinTelefono = 0;
        const telefonos = new Set();
        
        for (const row of datos) {
          const tel = normalizarTelefono(
            row.Telefono || row.TELEFONO || row.telefono
          );
          
          if (tel) {
            conTelefono++;
            telefonos.add(tel);
          } else {
            sinTelefono++;
          }
        }
        
        analisisExcel[hoja] = {
          total: datos.length,
          conTelefono,
          sinTelefono,
          telefonosUnicos: telefonos.size,
          telefonosSet: telefonos
        };
        
        console.log(`\n  📋 ${hoja}:`);
        console.log(`     • Total registros: ${datos.length}`);
        console.log(`     • Con teléfono: ${conTelefono}`);
        console.log(`     • Sin teléfono: ${sinTelefono}`);
        console.log(`     • Teléfonos únicos: ${telefonos.size}`);
        
      } catch (error) {
        console.log(`\n  ⚠️  ${hoja}: No se pudo leer`);
      }
    }
    
    // 3. Comparación: ¿Cuántos del Excel ya están en la BD?
    console.log('\n\n🔄 COMPARACIÓN EXCEL vs BASE DE DATOS:');
    console.log('-'.repeat(70));
    
    for (const hoja of hojas) {
      if (analisisExcel[hoja]) {
        const telefonosExcel = Array.from(analisisExcel[hoja].telefonosSet);
        
        if (telefonosExcel.length === 0) {
          console.log(`\n  📋 ${hoja}:`);
          console.log(`     • No hay teléfonos para comparar`);
          continue;
        }
        
        // Consultar cuántos ya existen en la BD
        const existenResult = await client.query(
          `SELECT COUNT(*) as count 
           FROM leads 
           WHERE telefono = ANY($1::text[])`,
          [telefonosExcel]
        );
        
        const yaExisten = parseInt(existenResult.rows[0].count);
        const faltanInsertar = telefonosExcel.length - yaExisten;
        const porcentajeExiste = ((yaExisten / telefonosExcel.length) * 100).toFixed(1);
        
        console.log(`\n  📋 ${hoja}:`);
        console.log(`     • Teléfonos únicos en Excel: ${telefonosExcel.length}`);
        console.log(`     • Ya existen en BD: ${yaExisten} (${porcentajeExiste}%)`);
        console.log(`     • Faltan por insertar: ${faltanInsertar}`);
      }
    }
    
    // 4. Análisis de distribución por origen
    console.log('\n\n📊 DISTRIBUCIÓN DE LEADS POR ORIGEN:');
    console.log('-'.repeat(70));
    
    const porOrigen = await client.query(`
      SELECT 
        o.nombre as origen,
        COUNT(l.id) as cantidad,
        ROUND(COUNT(l.id) * 100.0 / (SELECT COUNT(*) FROM leads), 1) as porcentaje
      FROM origenes o
      LEFT JOIN leads l ON l.origen_id = o.id
      GROUP BY o.id, o.nombre
      ORDER BY cantidad DESC
    `);
    
    for (const row of porOrigen.rows) {
      console.log(`  • ${row.origen}: ${row.cantidad} leads (${row.porcentaje}%)`);
    }
    
    // 5. Recomendación
    console.log('\n\n💡 RECOMENDACIÓN:');
    console.log('='.repeat(70));
    
    const baseCompleta = analisisExcel['BASE COMPLETA'];
    if (baseCompleta) {
      const faltanResult = await client.query(
        `SELECT COUNT(*) as count 
         FROM unnest($1::text[]) AS tel
         WHERE NOT EXISTS (SELECT 1 FROM leads WHERE telefono = tel)`,
        [Array.from(baseCompleta.telefonosSet)]
      );
      
      const faltan = parseInt(faltanResult.rows[0].count);
      
      if (faltan > 0) {
        console.log(`\n  🎯 EJECUTAR: node importacion-base-completa.js`);
        console.log(`\n     Esto importará ~${faltan} registros nuevos desde "BASE COMPLETA"`);
        console.log(`     Los ${baseCompleta.telefonosUnicos - faltan} registros ya existentes se omitirán automáticamente`);
      } else {
        console.log(`\n  ✅ Todos los registros de "BASE COMPLETA" ya están en la BD`);
        console.log(`     No es necesario ejecutar ninguna importación`);
      }
    }
    
    // 6. Detalles adicionales
    console.log('\n\n📈 ESTADÍSTICAS ADICIONALES:');
    console.log('-'.repeat(70));
    
    // Top localidades
    const topLocalidades = await client.query(`
      SELECT 
        l.nombre,
        COUNT(le.id) as cantidad
      FROM localidades l
      JOIN leads le ON le.localidad_id = l.id
      GROUP BY l.id, l.nombre
      ORDER BY cantidad DESC
      LIMIT 10
    `);
    
    console.log('\n  🌍 Top 10 Localidades:');
    for (const row of topLocalidades.rows) {
      console.log(`     ${row.nombre}: ${row.cantidad} leads`);
    }
    
    // Top cursos
    const topCursos = await client.query(`
      SELECT 
        c.nombre,
        COUNT(lc.lead_id) as cantidad
      FROM cursos c
      JOIN lead_cursos lc ON lc.curso_id = c.id
      GROUP BY c.id, c.nombre
      ORDER BY cantidad DESC
      LIMIT 10
    `);
    
    console.log('\n  📚 Top 10 Cursos de interés:');
    for (const row of topCursos.rows) {
      console.log(`     ${row.nombre}: ${row.cantidad} leads`);
    }
    
    // Distribución por género
    const porGenero = await client.query(`
      SELECT 
        g.descripcion,
        COUNT(l.id) as cantidad
      FROM generos g
      LEFT JOIN leads l ON l.genero_id = g.id
      GROUP BY g.id, g.descripcion
      ORDER BY cantidad DESC
    `);
    
    console.log('\n  👥 Distribución por Género:');
    for (const row of porGenero.rows) {
      console.log(`     ${row.descripcion}: ${row.cantidad} leads`);
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ Análisis completado\n');
    
  } catch (error) {
    console.error('❌ Error durante el análisis:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar
analizarDatos().catch(console.error);
