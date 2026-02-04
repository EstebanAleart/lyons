// app/api/leads/route.js
import { Lead, Genero, Localidad, Origen, HistorialEstadoLead, EstadoLead, LeadCurso, Curso, Interaccion, Usuario, Canal } from '@/lib/models';
import { sequelize } from '@/lib/models';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '500', 10);

    const countResult = await sequelize.query(
      'SELECT COUNT(*) as total FROM leads',
      { type: sequelize.QueryTypes.SELECT }
    );
    const total = parseInt(countResult[0]?.total || 0);

    // Query optimizada - combinamos las 3 subqueries de interacciones en 1
    const leads = await sequelize.query(`
      SELECT 
        l.id, l.nombre, l.apellido, l.email, l.telefono, l.localidad_id,
        l.created_at,
        loc.nombre AS localidad_nombre,
        g.descripcion AS genero,
        o.nombre AS origen_nombre,
        (SELECT el.nombre FROM historial_estado_lead h 
         JOIN estados_lead el ON h.estado_id = el.id 
         WHERE h.lead_id = l.id ORDER BY h.created_at DESC LIMIT 1) AS etapa,
        (SELECT c.nombre FROM lead_cursos lc 
         JOIN cursos c ON c.id = lc.curso_id 
         WHERE lc.lead_id = l.id ORDER BY lc.prioridad ASC LIMIT 1) AS curso,
        (SELECT c.id FROM lead_cursos lc 
         JOIN cursos c ON c.id = lc.curso_id 
         WHERE lc.lead_id = l.id ORDER BY lc.prioridad ASC LIMIT 1) AS curso_id,
        ultima_i.canal_nombre AS canal,
        ultima_i.usuario_nombre AS asesor,
        ultima_i.created_at AS ultimo_contacto
      FROM leads l
      LEFT JOIN localidades loc ON loc.id = l.localidad_id
      LEFT JOIN generos g ON g.id = l.genero_id
      LEFT JOIN origenes o ON o.id = l.origen_id
      LEFT JOIN LATERAL (
        SELECT 
          cn.nombre AS canal_nombre,
          u.nombre AS usuario_nombre,
          i.created_at
        FROM interacciones i
        LEFT JOIN canales cn ON cn.id = i.canal_id
        LEFT JOIN usuarios u ON u.id = i.usuario_id
        WHERE i.lead_id = l.id
        ORDER BY i.created_at DESC
        LIMIT 1
      ) ultima_i ON true
      ORDER BY l.created_at DESC, l.id ASC
      LIMIT :limit OFFSET :offset
    `, {
      replacements: { limit, offset },
      type: sequelize.QueryTypes.SELECT
    });

    const leadsFormateados = leads.map(l => ({
      id: l.id,
      nombre: l.nombre || '',
      apellido: l.apellido || '',
      email: l.email || '',
      telefono: l.telefono || '',
      curso: l.curso || '-',
      cursoId: l.curso_id || null,
      canal: l.canal || l.origen_nombre || '-',
      etapa: l.etapa || 'nuevo',
      asesor: l.asesor || '-',
      fechaCreacion: l.created_at ? new Date(l.created_at).toISOString().split('T')[0] : '-',
      ultimoContacto: l.ultimo_contacto 
        ? new Date(l.ultimo_contacto).toISOString().split('T')[0] 
        : (l.created_at ? new Date(l.created_at).toISOString().split('T')[0] : '-'),
      localidad: l.localidad_nombre || '',
      localidadId: l.localidad_id || null,
      genero: l.genero || ''
    }));

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

// POST sin cambios
export async function POST(request) {
  try {
    const body = await request.json();
    console.log('POST /api/leads - Request body:', body);
    const { nombre, apellido, email, telefono, localidadId, origenId, cursoId } = body;

    if (!nombre || !nombre.trim()) {
      return Response.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    }

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

    if (cursoId) {
      await LeadCurso.create({
        lead_id: lead.id,
        curso_id: cursoId,
        prioridad: 1,
      });
    }

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