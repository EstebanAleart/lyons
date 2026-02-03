// scripts/createTrackingTables.js
// Crear tablas de tracking para métricas del sistema

const { sequelize } = require('../lib/db');

async function createTrackingTables() {
  try {
    console.log('Creando tablas de tracking...');

    // Tabla PageView
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS page_views (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        path VARCHAR(500) NOT NULL,
        user_agent TEXT,
        ip_hash VARCHAR(64),
        referrer VARCHAR(500),
        session_id VARCHAR(100),
        device_type VARCHAR(20),
        browser VARCHAR(50),
        country VARCHAR(50),
        duration_ms INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Tabla page_views creada');

    // Tabla ApiMetric
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS api_metrics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        endpoint VARCHAR(500) NOT NULL,
        method VARCHAR(10),
        status_code INTEGER,
        response_time_ms INTEGER,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Tabla api_metrics creada');

    // Índices para búsquedas rápidas
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at);
      CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(path);
      CREATE INDEX IF NOT EXISTS idx_page_views_session ON page_views(session_id);
      CREATE INDEX IF NOT EXISTS idx_api_metrics_created_at ON api_metrics(created_at);
      CREATE INDEX IF NOT EXISTS idx_api_metrics_endpoint ON api_metrics(endpoint);
    `);
    console.log('✓ Índices creados');

    console.log('\n✅ Tablas de tracking creadas exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('Error creando tablas:', error);
    process.exit(1);
  }
}

createTrackingTables();
