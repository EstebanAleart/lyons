module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Usuario', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    rol: { type: DataTypes.STRING },
    activo: { type: DataTypes.BOOLEAN },
  }, { tableName: 'usuarios', timestamps: false });
};
