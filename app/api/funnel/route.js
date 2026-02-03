// app/api/funnel/route.js
// API Route para obtener datos del funnel desde la DB
import { HistorialEstadoLead, EstadoLead, Lead } from '@/lib/models';
import { sequelize } from '@/lib/models';

export async function GET(request) {
  try {
    // Contar leads por estado actual (último estado en historial)
    const estadosRaw = await sequelize.query(`
      SELECT el.nombre AS estado, COUNT(DISTINCT h.lead_id) AS cantidad
      FROM historial_estado_lead h
      JOIN estados_lead el ON h.estado_id = el.id
      WHERE h.id = (
        SELECT MAX(h2.id) FROM historial_estado_lead h2 WHERE h2.lead_id = h.lead_id
      )
      GROUP BY el.nombre
      ORDER BY cantidad DESC
    `, { type: sequelize.QueryTypes.SELECT });

    const total = estadosRaw.reduce((acc, e) => acc + parseInt(e.cantidad, 10), 0);
    const funnel = estadosRaw.map(e => ({
      estado: e.estado,
      cantidad: parseInt(e.cantidad, 10),
      porcentaje: total > 0 ? Math.round((parseInt(e.cantidad, 10) / total) * 100) : 0
    }));

    return Response.json(funnel);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
