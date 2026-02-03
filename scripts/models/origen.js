module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Origen', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING },
  }, { tableName: 'origenes', timestamps: false });
};
