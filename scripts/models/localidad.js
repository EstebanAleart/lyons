module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Localidad', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING },
    region: { type: DataTypes.STRING },
    pais: { type: DataTypes.STRING },
  }, { tableName: 'localidades', timestamps: false });
};
