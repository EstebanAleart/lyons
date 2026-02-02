const xlsx = require('xlsx');
const workbook = xlsx.readFile('N1 - Base de datos Lyon.xlsx');

// Solo hojas de leads
const sheets = ['Leads a captar', 'Leads a captar 2'];
const allPhones = new Map();

sheets.forEach(sheetName => {
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet, { defval: '' });
  
  console.log(`Hoja "${sheetName}": ${data.length} registros`);
  
  data.forEach(row => {
    const tel = (row.Telefono || '').toString().trim();
    if (tel && tel !== 'NaN') {
      if (!allPhones.has(tel)) {
        allPhones.set(tel, { count: 1, sheets: [sheetName] });
      } else {
        const entry = allPhones.get(tel);
        entry.count++;
        if (!entry.sheets.includes(sheetName)) {
          entry.sheets.push(sheetName);
        }
      }
    }
  });
});

console.log('\n=== ANÁLISIS DE LEADS ÚNICOS ===');
console.log('Total registros en ambas hojas:', 19890 + 5454);
console.log('Teléfonos ÚNICOS:', allPhones.size);
console.log('Registros duplicados (que sobran):', (19890 + 5454) - allPhones.size);

// Cuántos están duplicados entre las dos hojas
let crossSheetDups = 0;
let sameSheetDups = 0;
allPhones.forEach((val, phone) => {
  if (val.sheets.length > 1) crossSheetDups++;
  if (val.count > 1) sameSheetDups++;
});

console.log('\nTeléfonos en AMBAS hojas:', crossSheetDups);
console.log('Teléfonos con duplicados:', sameSheetDups);
