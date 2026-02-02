// Script para poblar la base de datos desde el archivo Excel N1 - Base de datos Lyon.xlsx
// Requiere: npm install xlsx pg sequelize


const XLSX = require('xlsx');
const path = require('path');
const db = require('./models');

// Lee el archivo Excel
const workbook = XLSX.readFile(path.join(__dirname, '../N1 - Base de datos Lyon.xlsx'));
const sheets = workbook.SheetNames;
const excelData = {};
sheets.forEach(sheet => {
  excelData[sheet] = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);
});


async function main() {
  try {
    await db.sequelize.authenticate();

    // Poblar tablas independientes primero
    if (excelData['generos']) {
      for (const row of excelData['generos']) {
        await db.Genero.create(row);
      }
    }
    if (excelData['localidades']) {
      for (const row of excelData['localidades']) {
        await db.Localidad.create(row);
      }
    }
    if (excelData['origenes']) {
      for (const row of excelData['origenes']) {
        await db.Origen.create(row);
      }
    }
    if (excelData['canales']) {
      for (const row of excelData['canales']) {
        await db.Canal.create(row);
      }
    }
    if (excelData['cursos']) {
      for (const row of excelData['cursos']) {
        await db.Curso.create(row);
      }
    }
    if (excelData['estados_lead']) {
      for (const row of excelData['estados_lead']) {
        await db.EstadoLead.create(row);
      }
    }

    // Poblar leads y dependientes
    if (excelData['leads']) {
      for (const row of excelData['leads']) {
        await db.Lead.create(row);
      }
    }
    if (excelData['clientes']) {
      for (const row of excelData['clientes']) {
        await db.Cliente.create(row);
      }
    }
    if (excelData['usuarios']) {
      for (const row of excelData['usuarios']) {
        await db.Usuario.create(row);
      }
    }
    if (excelData['interacciones']) {
      for (const row of excelData['interacciones']) {
        await db.Interaccion.create(row);
      }
    }
    if (excelData['historial_estado_lead']) {
      for (const row of excelData['historial_estado_lead']) {
        await db.HistorialEstadoLead.create(row);
      }
    }
    if (excelData['lead_cursos']) {
      for (const row of excelData['lead_cursos']) {
        await db.LeadCurso.create(row);
      }
    }

    console.log('Migración completada');
    await db.sequelize.close();
  } catch (err) {
    console.error('Error en la migración:', err);
  }
}

main();
