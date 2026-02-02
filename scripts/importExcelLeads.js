// scripts/importExcelLeads.js
// Migración Excel → PostgreSQL (Sequelize)
// Requiere: npm install xlsx dayjs
// Ejecuta: node scripts/importExcelLeads.js

const XLSX = require('xlsx');
const dayjs = require('dayjs');
const { sequelize } = require('./models/index.js');
const {
  Lead,
  Cliente,
  Interaccion,
  EstadoLead,
  HistorialEstadoLead,
  Origen,
  Canal,
  Genero,
  Localidad,
  Curso,
  LeadCurso
} = require('./models/index.js');

function parseFecha(value) {
  if (!value) return null;
  return dayjs(value).isValid() ? dayjs(value).toDate() : null;
}

async function getOrCreate(model, where, t) {
  const [row] = await model.findOrCreate({ where, transaction: t });
  return row.id;
}

async function getEstadoId(nombre, t) {
  if (!nombre) nombre = 'nuevo';
  const [row] = await EstadoLead.findOrCreate({ where: { nombre: nombre.toLowerCase() }, transaction: t });
  return row.id;
}

async function findLead({ email, telefono }, t) {
  if (!email && !telefono) return null;
  return await Lead.findOne({
    where: {
      [sequelize.Op.or]: [
        email ? { email } : null,
        telefono ? { telefono } : null
      ].filter(Boolean)
    },
    transaction: t
  });
}

function parseCursos(cursoStr) {
  if (!cursoStr) return [];
  return cursoStr.split(',').map(c => c.trim()).filter(Boolean);
}

function cleanNulls(obj) {
  for (const key in obj) {
    if (obj[key] === undefined) obj[key] = null;
  }
  return obj;
}

// Procesa hoja Leads a captar y Leads a captar 2
async function importLeadsCaptar(rows, t, origenNombre) {
  let leadsCreados = 0, leadsReutilizados = 0, cursosRelacionados = 0;
  for (const row of rows) {
    try {
      let lead = await findLead({ email: row['Email'], telefono: row['Telefono'] }, t);
      if (lead) {
        leadsReutilizados++;
        console.log(`Lead reutilizado: ${lead.email || lead.telefono}`);
      } else {
        const generoValue = row['Genero'] ? row['Genero'].toLowerCase().trim() : null;
        const genero_id = generoValue ? await getOrCreate(Genero, { descripcion: generoValue }, t) : null;
        const localidad_id = row['Localidad'] ? await getOrCreate(Localidad, { nombre: row['Localidad'] }, t) : null;
        const origen_id = await getOrCreate(Origen, { nombre: origenNombre }, t);
        const leadData = cleanNulls({
          nombre: row['Nombre'],
          apellido: row['Apellido'],
          telefono: row['Telefono'],
          email: row['Email'],
          genero_id,
          localidad_id,
          origen_id,
          created_at: new Date()
        });
        lead = await Lead.create(leadData, { transaction: t });
        leadsCreados++;
        console.log(`Lead creado: ${lead.email || lead.telefono}`);
      }
      // Estado inicial
      const estado_id = await getEstadoId('nuevo', t);
      await HistorialEstadoLead.create(cleanNulls({
        lead_id: lead.id,
        estado_id,
        cambiado_por: 'import',
        created_at: lead.created_at
      }), { transaction: t });
      // Curso de interés
      if (row['Cursodeinteres']) {
        const cursos = parseCursos(row['Cursodeinteres']);
        let prioridad = 1;
        for (const nombreCurso of cursos) {
          const curso_id = await getOrCreate(Curso, { nombre: nombreCurso }, t);
          await LeadCurso.findOrCreate({
            where: cleanNulls({ lead_id: lead.id, curso_id }),
            defaults: cleanNulls({ prioridad }),
            transaction: t
          });
          cursosRelacionados++;
          prioridad++;
        }
      }
    } catch (err) {
      console.error('❌ Error en fila Leads a captar:', row, err.message);
      continue;
    }
  }
  console.log(`\nLeads a captar: Creados: ${leadsCreados}, Reutilizados: ${leadsReutilizados}, Cursos relacionados: ${cursosRelacionados}`);
}

// Procesa hoja Clientes
async function importClientes(rows, t) {
  let leadsCreados = 0, leadsReutilizados = 0, clientesCreados = 0;
  for (const row of rows) {
    try {
      let lead = await findLead({ telefono: row['telefono'] }, t);
      if (lead) {
        leadsReutilizados++;
        console.log(`Lead reutilizado: ${lead.telefono}`);
      } else {
        const leadData = cleanNulls({
          nombre: row['Nombre'],
          apellido: row['Apellido'],
          telefono: row['telefono'],
          created_at: new Date()
        });
        lead = await Lead.create(leadData, { transaction: t });
        leadsCreados++;
        console.log(`Lead creado: ${lead.telefono}`);
      }
      // Estado inicial
      const estado_id = await getEstadoId('convertido', t);
      await HistorialEstadoLead.create(cleanNulls({
        lead_id: lead.id,
        estado_id,
        cambiado_por: 'import',
        created_at: lead.created_at
      }), { transaction: t });
      // Cliente
      await Cliente.findOrCreate({
        where: cleanNulls({ lead_id: lead.id }),
        defaults: cleanNulls({
          fecha_alta: lead.created_at,
          estado_cliente: 'activo',
          created_at: lead.created_at
        }),
        transaction: t
      });
      clientesCreados++;
      console.log(`Cliente creado para lead ${lead.id}`);
    } catch (err) {
      console.error('❌ Error en fila Clientes:', row, err.message);
      continue;
    }
  }
  console.log(`\nClientes: Leads creados: ${leadsCreados}, Leads reutilizados: ${leadsReutilizados}, Clientes creados: ${clientesCreados}`);
}

async function main() {
  try {
    await sequelize.authenticate();
    const workbook = XLSX.readFile('N1 - Base de datos Lyon.xlsx');
    const sheetNames = workbook.SheetNames;
    await sequelize.transaction(async (t) => {
      for (const sheetName of sheetNames) {
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: null });
        if (!rows.length) continue;
        if (sheetName.toLowerCase().includes('leads a captar')) {
          await importLeadsCaptar(rows, t, sheetName);
        } else if (sheetName.toLowerCase().includes('clientes')) {
          await importClientes(rows, t);
        }
      }
    });
    console.log('✅ Migración multi-hoja finalizada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error general:', error.message);
    process.exit(1);
  }
}

main();
