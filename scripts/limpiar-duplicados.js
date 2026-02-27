/**
 * Script para limpiar duplicados en clientes y leads
 * Mantiene el registro más antiguo por teléfono
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function main() {
  const client = await pool.connect();

  try {
    console.log('🔍 Analizando duplicados...\n');

    // Estado inicial
    const antes = await client.query(`
      SELECT
        (SELECT COUNT(*) FROM leads) as total_leads,
        (SELECT COUNT(*) FROM clientes) as total_clientes
    `);
    console.log('📊 Estado ANTES de limpieza:');
    console.log(`  • Leads: ${antes.rows[0].total_leads}`);
    console.log(`  • Clientes: ${antes.rows[0].total_clientes}`);

    // Contar duplicados - usar created_at para encontrar el más antiguo (id es UUID)
    const duplicados = await client.query(`
      SELECT COUNT(*) as clientes_a_eliminar
      FROM clientes c
      JOIN leads l ON c.lead_id = l.id
      WHERE l.telefono IN (
        SELECT telefono FROM leads WHERE telefono IS NOT NULL GROUP BY telefono HAVING COUNT(*) > 1
      )
      AND l.id NOT IN (
        SELECT DISTINCT ON (telefono) id
        FROM leads
        WHERE telefono IS NOT NULL
        ORDER BY telefono, created_at ASC
      )
    `);

    console.log(`\n🗑️  Clientes duplicados a eliminar: ${duplicados.rows[0].clientes_a_eliminar}`);

    // Confirmar
    console.log('\n⚠️  Iniciando limpieza en 3 segundos... (Ctrl+C para cancelar)');
    await new Promise(r => setTimeout(r, 3000));

    await client.query('BEGIN');

    // 1. Eliminar clientes cuyos leads son duplicados (no son el más antiguo)
    console.log('\n1️⃣  Eliminando clientes duplicados...');
    const deleteClientes = await client.query(`
      DELETE FROM clientes
      WHERE lead_id IN (
        SELECT l.id
        FROM leads l
        WHERE l.telefono IN (
          SELECT telefono FROM leads WHERE telefono IS NOT NULL GROUP BY telefono HAVING COUNT(*) > 1
        )
        AND l.id NOT IN (
          SELECT DISTINCT ON (telefono) id
          FROM leads
          WHERE telefono IS NOT NULL
          ORDER BY telefono, created_at ASC
        )
      )
    `);
    console.log(`   ✓ Clientes eliminados: ${deleteClientes.rowCount}`);

    // 2. Eliminar relaciones lead_cursos de leads duplicados
    console.log('\n2️⃣  Eliminando relaciones lead_cursos de leads duplicados...');
    const deleteLeadCursos = await client.query(`
      DELETE FROM lead_cursos
      WHERE lead_id IN (
        SELECT l.id
        FROM leads l
        WHERE l.telefono IN (
          SELECT telefono FROM leads WHERE telefono IS NOT NULL GROUP BY telefono HAVING COUNT(*) > 1
        )
        AND l.id NOT IN (
          SELECT DISTINCT ON (telefono) id
          FROM leads
          WHERE telefono IS NOT NULL
          ORDER BY telefono, created_at ASC
        )
      )
    `);
    console.log(`   ✓ Relaciones eliminadas: ${deleteLeadCursos.rowCount}`);

    // 3. Eliminar leads duplicados (mantener el más antiguo por teléfono)
    console.log('\n3️⃣  Eliminando leads duplicados...');
    const deleteLeads = await client.query(`
      DELETE FROM leads
      WHERE id IN (
        SELECT l.id
        FROM leads l
        WHERE l.telefono IN (
          SELECT telefono FROM leads WHERE telefono IS NOT NULL GROUP BY telefono HAVING COUNT(*) > 1
        )
        AND l.id NOT IN (
          SELECT DISTINCT ON (telefono) id
          FROM leads
          WHERE telefono IS NOT NULL
          ORDER BY telefono, created_at ASC
        )
      )
    `);
    console.log(`   ✓ Leads eliminados: ${deleteLeads.rowCount}`);

    await client.query('COMMIT');

    // Estado final
    const despues = await client.query(`
      SELECT
        (SELECT COUNT(*) FROM leads) as total_leads,
        (SELECT COUNT(*) FROM clientes) as total_clientes
    `);

    console.log('\n📊 Estado DESPUÉS de limpieza:');
    console.log(`  • Leads: ${despues.rows[0].total_leads} (antes: ${antes.rows[0].total_leads})`);
    console.log(`  • Clientes: ${despues.rows[0].total_clientes} (antes: ${antes.rows[0].total_clientes})`);

    // Verificar que no quedan duplicados
    const verificar = await client.query(`
      SELECT COUNT(*) as duplicados_restantes
      FROM (
        SELECT telefono FROM leads WHERE telefono IS NOT NULL GROUP BY telefono HAVING COUNT(*) > 1
      ) sub
    `);

    console.log(`\n✅ Duplicados restantes: ${verificar.rows[0].duplicados_restantes}`);
    console.log('\n🎉 Limpieza completada!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Error:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
