// lib/models/index.js
// Modelos Sequelize para Next.js SSR

const { sequelize, Sequelize } = require('../db');
const { DataTypes } = Sequelize;

// Genero
const Genero = sequelize.define('Genero', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  codigo: { type: DataTypes.STRING },
  descripcion: { type: DataTypes.STRING },
}, { tableName: 'generos', timestamps: false });

// Localidad
const Localidad = sequelize.define('Localidad', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING },
  region: { type: DataTypes.STRING },
  pais: { type: DataTypes.STRING },
}, { tableName: 'localidades', timestamps: false });

// Origen
const Origen = sequelize.define('Origen', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING },
}, { tableName: 'origenes', timestamps: false });

// Canal
const Canal = sequelize.define('Canal', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING },
}, { tableName: 'canales', timestamps: false });

// Curso
const Curso = sequelize.define('Curso', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING },
  activo: { type: DataTypes.BOOLEAN },
}, { tableName: 'cursos', timestamps: false });

// EstadoLead
const EstadoLead = sequelize.define('EstadoLead', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING },
}, { tableName: 'estados_lead', timestamps: false });

// Lead
const Lead = sequelize.define('Lead', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING },
  apellido: { type: DataTypes.STRING },
  telefono: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  genero_id: { type: DataTypes.INTEGER },
  localidad_id: { type: DataTypes.INTEGER },
  origen_id: { type: DataTypes.INTEGER },
  created_at: { type: DataTypes.DATE },
  updated_at: { type: DataTypes.DATE },
}, { tableName: 'leads', timestamps: false });

// Cliente
const Cliente = sequelize.define('Cliente', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  lead_id: { type: DataTypes.INTEGER, unique: true },
  fecha_alta: { type: DataTypes.DATE },
  estado_cliente: { type: DataTypes.STRING },
  created_at: { type: DataTypes.DATE },
}, { tableName: 'clientes', timestamps: false });

// Usuario
const Usuario = sequelize.define('Usuario', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  rol: { type: DataTypes.STRING },
  activo: { type: DataTypes.BOOLEAN },
}, { tableName: 'usuarios', timestamps: false });

// Interaccion
const Interaccion = sequelize.define('Interaccion', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  lead_id: { type: DataTypes.INTEGER },
  usuario_id: { type: DataTypes.INTEGER },
  canal_id: { type: DataTypes.INTEGER },
  resultado: { type: DataTypes.STRING },
  nota: { type: DataTypes.STRING },
  created_at: { type: DataTypes.DATE },
  updated_at: { type: DataTypes.DATE },
}, { tableName: 'interacciones', timestamps: false });

// HistorialEstadoLead
const HistorialEstadoLead = sequelize.define('HistorialEstadoLead', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  lead_id: { type: DataTypes.INTEGER },
  estado_id: { type: DataTypes.INTEGER },
  cambiado_por: { type: DataTypes.STRING },
  created_at: { type: DataTypes.DATE },
}, { tableName: 'historial_estado_lead', timestamps: false });

// LeadCurso
const LeadCurso = sequelize.define('LeadCurso', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  lead_id: { type: DataTypes.INTEGER },
  curso_id: { type: DataTypes.INTEGER },
  prioridad: { type: DataTypes.INTEGER },
}, { tableName: 'lead_cursos', timestamps: false });

// Relaciones
Lead.belongsTo(Genero, { foreignKey: 'genero_id' });
Lead.belongsTo(Localidad, { foreignKey: 'localidad_id' });
Lead.belongsTo(Origen, { foreignKey: 'origen_id' });
Lead.hasOne(Cliente, { foreignKey: 'lead_id' });
Lead.hasMany(Interaccion, { foreignKey: 'lead_id' });
Lead.hasMany(HistorialEstadoLead, { foreignKey: 'lead_id' });
Lead.hasMany(LeadCurso, { foreignKey: 'lead_id' });
Cliente.belongsTo(Lead, { foreignKey: 'lead_id' });
Interaccion.belongsTo(Lead, { foreignKey: 'lead_id' });
Interaccion.belongsTo(Usuario, { foreignKey: 'usuario_id' });
Interaccion.belongsTo(Canal, { foreignKey: 'canal_id' });
Usuario.hasMany(Interaccion, { foreignKey: 'usuario_id' });
Canal.hasMany(Interaccion, { foreignKey: 'canal_id' });
Curso.hasMany(LeadCurso, { foreignKey: 'curso_id' });
LeadCurso.belongsTo(Lead, { foreignKey: 'lead_id' });
LeadCurso.belongsTo(Curso, { foreignKey: 'curso_id' });
EstadoLead.hasMany(HistorialEstadoLead, { foreignKey: 'estado_id' });
HistorialEstadoLead.belongsTo(Lead, { foreignKey: 'lead_id' });
HistorialEstadoLead.belongsTo(EstadoLead, { foreignKey: 'estado_id' });

module.exports = {
  sequelize,
  Genero,
  Localidad,
  Origen,
  Canal,
  Curso,
  EstadoLead,
  Lead,
  Cliente,
  Usuario,
  Interaccion,
  HistorialEstadoLead,
  LeadCurso,
};
