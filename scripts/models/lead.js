module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Lead', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING },
    apellido: { type: DataTypes.STRING },
    telefono: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    genero_id: { type: DataTypes.INTEGER, references: { model: 'generos', key: 'id' } },
    localidad_id: { type: DataTypes.INTEGER, references: { model: 'localidades', key: 'id' } },
    origen_id: { type: DataTypes.INTEGER, references: { model: 'origenes', key: 'id' } },
    created_at: { type: DataTypes.DATE },
    updated_at: { type: DataTypes.DATE },
  }, { tableName: 'leads', timestamps: false });
};
