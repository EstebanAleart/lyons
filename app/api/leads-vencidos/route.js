// app/api/leads-vencidos/route.js
// API Route para obtener leads vencidos (sin contacto en 30 días)
import { Lead, Interaccion, HistorialEstadoLead, EstadoLead } from '@/lib/models';
import { sequelize } from '@/lib/models';
import { Op } from 'sequelize';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = parseInt(searchParams.get('limit') || '500');
    
    const hace30Dias = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Primero obtener el total
    const countResult = await sequelize.query(`
      SELECT COUNT(*) as total FROM (
        SELECT l.id
        FROM leads l
        LEFT JOIN interacciones i ON i.lead_id = l.id
        GROUP BY l.id
        HAVING MAX(i.updated_at) < :hace30Dias OR MAX(i.updated_at) IS NULL
      ) AS vencidos
    `, {
      replacements: { hace30Dias },
      type: sequelize.QueryTypes.SELECT
    });
    
    const total = parseInt(countResult[0]?.total || 0);

    // Leads con última interacción hace más de 30 días
    const leadsVencidos = await sequelize.query(`
      SELECT 
        l.id, l.nombre, l.apellido, l.email, l.telefono,
        MAX(i.updated_at) AS ultimo_contacto,
        EXTRACT(DAY FROM NOW() - MAX(i.updated_at)) AS dias_sin_contacto,
        (SELECT el.nombre FROM historial_estado_lead h 
         JOIN estados_lead el ON h.estado_id = el.id 
         WHERE h.lead_id = l.id ORDER BY h.created_at DESC LIMIT 1) AS estado
      FROM leads l
      LEFT JOIN interacciones i ON i.lead_id = l.id
      GROUP BY l.id
      HAVING MAX(i.updated_at) < :hace30Dias OR MAX(i.updated_at) IS NULL
      ORDER BY dias_sin_contacto DESC NULLS FIRST, l.id ASC
      LIMIT :limit OFFSET :offset
    `, {
      replacements: { hace30Dias, limit, offset },
      type: sequelize.QueryTypes.SELECT
    });

    const result = leadsVencidos.map(l => ({
      id: l.id,
      nombre: l.nombre,
      apellido: l.apellido,
      email: l.email,
      telefono: l.telefono,
      ultimoContacto: l.ultimo_contacto,
      diasSinContacto: l.dias_sin_contacto ? Math.round(l.dias_sin_contacto) : 999,
      estado: l.estado || 'nuevo'
    }));

    return Response.json({
      leadsVencidos: result,
      total,
      offset,
      limit,
      hasMore: offset + result.length < total
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
