module.exports = (sequelize, DataTypes) => {
  return sequelize.define('LeadCurso', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    lead_id: { type: DataTypes.INTEGER, references: { model: 'leads', key: 'id' } },
    curso_id: { type: DataTypes.INTEGER, references: { model: 'cursos', key: 'id' } },
    prioridad: { type: DataTypes.INTEGER },
  }, { tableName: 'lead_cursos', timestamps: false });
};
