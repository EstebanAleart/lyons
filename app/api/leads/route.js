// app/api/leads/route.js
// API Route para obtener leads desde la DB
import { Lead, Genero, Localidad, Origen, HistorialEstadoLead, EstadoLead, LeadCurso, Curso } from '@/lib/models';

export async function GET(request) {
  try {
    const leads = await Lead.findAll({
      include: [
        { model: Genero, attributes: ['descripcion'] },
        { model: Localidad, attributes: ['nombre'] },
        { model: Origen, attributes: ['nombre'] },
        { model: HistorialEstadoLead, include: [{ model: EstadoLead, attributes: ['nombre'] }], order: [['created_at', 'DESC']], limit: 1 },
        { model: LeadCurso, include: [{ model: Curso, attributes: ['nombre'] }] }
      ],
      order: [['created_at', 'DESC']],
      limit: 100
    });
    return Response.json(leads);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
