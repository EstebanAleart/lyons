module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Interaccion', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    lead_id: { type: DataTypes.INTEGER, references: { model: 'leads', key: 'id' } },
    usuario_id: { type: DataTypes.INTEGER, references: { model: 'usuarios', key: 'id' } },
    canal_id: { type: DataTypes.INTEGER, references: { model: 'canales', key: 'id' } },
    resultado: { type: DataTypes.STRING },
    nota: { type: DataTypes.STRING },
    created_at: { type: DataTypes.DATE },
    updated_at: { type: DataTypes.DATE },
  }, { tableName: 'interacciones', timestamps: false });
};
