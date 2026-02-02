module.exports = (sequelize, DataTypes) => {
  return sequelize.define('EstadoLead', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING },
  }, { tableName: 'estados_lead', timestamps: false });
};
