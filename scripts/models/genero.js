module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Genero', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    codigo: { type: DataTypes.STRING },
    descripcion: { type: DataTypes.STRING },
  }, { tableName: 'generos', timestamps: false });
};
