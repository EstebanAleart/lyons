// models/index.js
// Inicializa Sequelize y exporta la instancia y los modelos


const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: process.env.DB_DIALECT || 'postgres',
    logging: false,
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Genero = require('./genero')(sequelize, DataTypes);
db.Localidad = require('./localidad')(sequelize, DataTypes);
db.Origen = require('./origen')(sequelize, DataTypes);
db.Canal = require('./canal')(sequelize, DataTypes);
db.Curso = require('./curso')(sequelize, DataTypes);
db.Lead = require('./lead')(sequelize, DataTypes);
db.Cliente = require('./cliente')(sequelize, DataTypes);
db.Usuario = require('./usuario')(sequelize, DataTypes);
db.Interaccion = require('./interaccion')(sequelize, DataTypes);
db.EstadoLead = require('./estadoLead')(sequelize, DataTypes);
db.HistorialEstadoLead = require('./historialEstadoLead')(sequelize, DataTypes);
db.LeadCurso = require('./leadCurso')(sequelize, DataTypes);

// Relaciones
// Lead
// Lead pertenece a Genero, Localidad, Origen
// Lead tiene muchos Interacciones, HistorialEstadoLead, LeadCurso, Cliente
// Cliente pertenece a Lead
// Interaccion pertenece a Lead, Usuario, Canal
// LeadCurso pertenece a Lead y Curso
// HistorialEstadoLead pertenece a Lead y EstadoLead
// Usuario tiene muchas Interacciones
// Canal tiene muchas Interacciones
// Curso tiene muchos LeadCurso
// EstadoLead tiene muchos HistorialEstadoLead

db.Lead.belongsTo(db.Genero, { foreignKey: 'genero_id' });
db.Lead.belongsTo(db.Localidad, { foreignKey: 'localidad_id' });
db.Lead.belongsTo(db.Origen, { foreignKey: 'origen_id' });
db.Lead.hasOne(db.Cliente, { foreignKey: 'lead_id' });
db.Lead.hasMany(db.Interaccion, { foreignKey: 'lead_id' });
db.Lead.hasMany(db.HistorialEstadoLead, { foreignKey: 'lead_id' });
db.Lead.hasMany(db.LeadCurso, { foreignKey: 'lead_id' });
db.Cliente.belongsTo(db.Lead, { foreignKey: 'lead_id' });
db.Interaccion.belongsTo(db.Lead, { foreignKey: 'lead_id' });
db.Interaccion.belongsTo(db.Usuario, { foreignKey: 'usuario_id' });
db.Interaccion.belongsTo(db.Canal, { foreignKey: 'canal_id' });
db.Usuario.hasMany(db.Interaccion, { foreignKey: 'usuario_id' });
db.Canal.hasMany(db.Interaccion, { foreignKey: 'canal_id' });
db.Curso.hasMany(db.LeadCurso, { foreignKey: 'curso_id' });
db.LeadCurso.belongsTo(db.Lead, { foreignKey: 'lead_id' });
db.LeadCurso.belongsTo(db.Curso, { foreignKey: 'curso_id' });
db.EstadoLead.hasMany(db.HistorialEstadoLead, { foreignKey: 'estado_id' });
db.HistorialEstadoLead.belongsTo(db.Lead, { foreignKey: 'lead_id' });
db.HistorialEstadoLead.belongsTo(db.EstadoLead, { foreignKey: 'estado_id' });

db.sequelize = sequelize;

module.exports = db;
