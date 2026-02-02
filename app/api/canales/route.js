// app/api/canales/route.js
// API Route para obtener métricas por canal desde la DB
import { Interaccion, Canal, Cliente } from '@/lib/models';
import { sequelize } from '@/lib/models';

export async function GET(request) {
  try {
    const canales = await sequelize.query(`
      SELECT c.nombre AS canal,
        COUNT(DISTINCT i.lead_id) AS total,
        COUNT(DISTINCT i.lead_id) FILTER (WHERE i.resultado IS NOT NULL) AS contactados,
        COUNT(DISTINCT cl.lead_id) AS convertidos
      FROM canales c
      LEFT JOIN interacciones i ON i.canal_id = c.id
      LEFT JOIN clientes cl ON cl.lead_id = i.lead_id
      GROUP BY c.nombre
      ORDER BY total DESC
    `, { type: sequelize.QueryTypes.SELECT });

    const result = canales.map(c => ({
      canal: c.canal,
      total: parseInt(c.total, 10),
      contactados: parseInt(c.contactados, 10),
      convertidos: parseInt(c.convertidos, 10),
      tasaConversion: c.total > 0 ? ((c.convertidos / c.total) * 100).toFixed(1) : 0
    }));

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
