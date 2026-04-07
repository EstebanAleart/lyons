import { supabase } from '@/lib/supabase'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const { data, error } = await supabase
      .from('historial_estado_lead')
      .select('id, estado_id, cambiado_por, created_at, estados_lead(id, nombre, descripcion)')
      .eq('lead_id', id)
      .order('created_at', { ascending: false })
    if (error) throw error

    return Response.json(data.map(h => ({
      id: h.id,
      estadoId: h.estado_id,
      estado: h.estados_lead?.nombre || 'Desconocido',
      descripcion: h.estados_lead?.descripcion,
      fecha: h.created_at,
      cambiadoPor: h.cambiado_por || null,
    })))
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = await params
    const { estadoId, cambiadoPor } = await request.json()
    if (!estadoId) return Response.json({ error: 'estadoId es requerido' }, { status: 400 })

    const [{ data: lead }, { data: estado }] = await Promise.all([
      supabase.from('leads').select('id').eq('id', id).single(),
      supabase.from('estados_lead').select('id, nombre').eq('id', estadoId).single()
    ])
    if (!lead) return Response.json({ error: 'Lead no encontrado' }, { status: 404 })
    if (!estado) return Response.json({ error: 'Estado no encontrado' }, { status: 404 })

    const { data: entry, error } = await supabase.from('historial_estado_lead')
      .insert({ lead_id: id, estado_id: estadoId, cambiado_por: cambiadoPor || null, created_at: new Date().toISOString() })
      .select().single()
    if (error) throw error

    return Response.json({ success: true, historial: { id: entry.id, estadoId: entry.estado_id, estado: estado.nombre, fecha: entry.created_at, cambiadoPor: entry.cambiado_por } })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
