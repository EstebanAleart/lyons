module.exports = (sequelize, DataTypes) => {
  return sequelize.define('HistorialEstadoLead', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    lead_id: { type: DataTypes.INTEGER, references: { model: 'leads', key: 'id' } },
    estado_id: { type: DataTypes.INTEGER, references: { model: 'estados_lead', key: 'id' } },
    cambiado_por: { type: DataTypes.STRING },
    created_at: { type: DataTypes.DATE },
  }, { tableName: 'historial_estado_lead', timestamps: false });
};
