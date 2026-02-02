module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Curso', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING },
    activo: { type: DataTypes.BOOLEAN },
  }, { tableName: 'cursos', timestamps: false });
};
