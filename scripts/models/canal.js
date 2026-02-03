module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Canal', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING },
  }, { tableName: 'canales', timestamps: false });
};
