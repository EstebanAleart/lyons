// app/api/leads/route.js
// API Route para obtener leads desde la DB con paginación
import { Lead, Genero, Localidad, Origen, HistorialEstadoLead, EstadoLead, LeadCurso, Curso, Interaccion, Usuario, Canal } from '@/lib/models';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '500', 10);

    // Obtener total de leads
    const total = await Lead.count();

    // Obtener chunk de leads
    const leads = await Lead.findAll({
      include: [
        { model: Genero, attributes: ['descripcion'] },
        { model: Localidad, attributes: ['nombre'] },
        { model: Origen, attributes: ['nombre'] },
        { model: HistorialEstadoLead, include: [{ model: EstadoLead, attributes: ['nombre'] }], order: [['created_at', 'DESC']] },
        { model: LeadCurso, include: [{ model: Curso, attributes: ['nombre'] }] },
        { model: Interaccion, include: [{ model: Usuario, attributes: ['nombre'] }, { model: Canal, attributes: ['nombre'] }], order: [['created_at', 'DESC']], limit: 1 }
      ],
      order: [['created_at', 'DESC'], ['id', 'ASC']],
      offset,
      limit
    });

    // Formatear datos para el frontend
    const leadsFormateados = leads.map(l => {
      const lead = l.toJSON();
      
      // Obtener estado actual (último historial)
      const ultimoHistorial = lead.HistorialEstadoLeads?.[0];
      const estado = ultimoHistorial?.EstadoLead?.nombre || 'nuevo';
      
      // Obtener curso principal
      const cursosPrincipales = lead.LeadCursos?.map(lc => lc.Curso?.nombre).filter(Boolean);
      const curso = cursosPrincipales?.[0] || '-';
      
      // Obtener última interacción
      const ultimaInteraccion = lead.Interaccions?.[0];
      const canal = ultimaInteraccion?.Canal?.nombre || lead.Origen?.nombre || '-';
      const asesor = ultimaInteraccion?.Usuario?.nombre || '-';
      const ultimoContacto = ultimaInteraccion?.created_at 
        ? new Date(ultimaInteraccion.created_at).toISOString().split('T')[0]
        : (lead.created_at ? new Date(lead.created_at).toISOString().split('T')[0] : '-');

      return {
        id: lead.id,
        nombre: `${lead.nombre || ''} ${lead.apellido || ''}`.trim(),
        email: lead.email || '',
        telefono: lead.telefono || '',
        curso,
        canal,
        etapa: estado,
        asesor,
        fechaCreacion: lead.created_at ? new Date(lead.created_at).toISOString().split('T')[0] : '-',
        ultimoContacto,
        localidad: lead.Localidad?.nombre || '',
        genero: lead.Genero?.descripcion || ''
      };
    });

    const hasMore = offset + leads.length < total;

    return Response.json({
      leads: leadsFormateados,
      total,
      offset,
      limit,
      hasMore
    });
  } catch (error) {
    console.error('Error en /api/leads:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
