import { supabase } from '@/lib/supabase'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    const limit = parseInt(searchParams.get('limit') || '500', 10)

    const { data, error } = await supabase.rpc('get_leads_list', { p_limit: limit, p_offset: offset })
    if (error) throw error

    const total = data[0]?.total_count ? parseInt(data[0].total_count) : 0
    return Response.json({
      leads: data.map(l => ({
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
      })),
      total, offset, limit, hasMore: offset + data.length < total
    })
  } catch (error) {
    console.error('Error en /api/leads:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { nombre, apellido, email, telefono, localidadId, origenId, cursoId } = await request.json()
    if (!nombre?.trim()) return Response.json({ error: 'El nombre es obligatorio' }, { status: 400 })

    const now = new Date().toISOString()
    const { data: lead, error } = await supabase.from('leads')
      .insert({ nombre: nombre.trim(), apellido: apellido?.trim() || null, email: email?.trim() || null, telefono: telefono?.trim() || null, localidad_id: localidadId || null, origen_id: origenId || null, created_at: now, updated_at: now })
      .select('id').single()
    if (error) throw error

    const [{ data: estadoNuevo }] = await Promise.all([
      supabase.from('estados_lead').select('id').eq('nombre', 'nuevo').single(),
      cursoId ? supabase.from('lead_cursos').insert({ lead_id: lead.id, curso_id: cursoId, prioridad: 1 }) : Promise.resolve()
    ])
    if (estadoNuevo) {
      await supabase.from('historial_estado_lead').insert({ lead_id: lead.id, estado_id: estadoNuevo.id, created_at: now })
    }

    return Response.json({ id: lead.id, message: 'Lead creado exitosamente' }, { status: 201 })
  } catch (error) {
    console.error('Error al crear lead:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
