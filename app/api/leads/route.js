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

// POST - Crear nuevo lead
export async function POST(request) {
  try {
    const body = await request.json();
    const { nombre, apellido, email, telefono, localidadId, origenId, cursoId } = body;

    if (!nombre || !nombre.trim()) {
      return Response.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    }

    // Crear el lead
    const lead = await Lead.create({
      nombre: nombre.trim(),
      apellido: apellido?.trim() || null,
      email: email?.trim() || null,
      telefono: telefono?.trim() || null,
      localidad_id: localidadId || null,
      origen_id: origenId || null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Si hay curso, crear la relación
    if (cursoId) {
      await LeadCurso.create({
        lead_id: lead.id,
        curso_id: cursoId,
        prioridad: 1,
      });
    }

    // Crear historial de estado inicial
    const estadoNuevo = await EstadoLead.findOne({ where: { nombre: 'nuevo' } });
    if (estadoNuevo) {
      await HistorialEstadoLead.create({
        lead_id: lead.id,
        estado_id: estadoNuevo.id,
        created_at: new Date(),
      });
    }

    return Response.json({ 
      id: lead.id, 
      message: 'Lead creado exitosamente' 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error al crear lead:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
