module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Cliente', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    lead_id: { type: DataTypes.INTEGER, unique: true, references: { model: 'leads', key: 'id' } },
    fecha_alta: { type: DataTypes.DATE },
    estado_cliente: { type: DataTypes.STRING },
    created_at: { type: DataTypes.DATE },
  }, { tableName: 'clientes', timestamps: false });
};
