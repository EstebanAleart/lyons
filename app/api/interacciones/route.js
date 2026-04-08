import { supabase } from '@/lib/supabase'

const METODO_TO_CANAL = { whatsapp: 'WhatsApp', email: 'Email', llamada: 'Teléfono' }

export async function POST(request) {
  try {
    const { leadId, metodo, nota, usuarioId } = await request.json()
    if (!leadId) return Response.json({ error: 'leadId es requerido' }, { status: 400 })
    if (!metodo) return Response.json({ error: 'metodo es requerido' }, { status: 400 })

    const canalNombre = METODO_TO_CANAL[metodo] || metodo
    let { data: canal } = await supabase.from('canales').select('id').eq('nombre', canalNombre).single()
    if (!canal) {
      const { data: nuevo } = await supabase.from('canales').insert({ nombre: canalNombre }).select('id').single()
      canal = nuevo
    }

    const now = new Date().toISOString()
    const { data: interaccion, error } = await supabase.from('interacciones')
      .insert({ lead_id: leadId, canal_id: canal.id, usuario_id: usuarioId || null, resultado: 'contactado', nota: nota || null, created_at: now, updated_at: now })
      .select('id, lead_id, nota, created_at').single()
    if (error) throw error

    return Response.json({ success: true, interaccion: { id: interaccion.id, leadId: interaccion.lead_id, canal: canalNombre, nota: interaccion.nota, fecha: interaccion.created_at } })
  } catch (error) {
    console.error('Error al crear interacción:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const leadId = new URL(request.url).searchParams.get('leadId')
    if (!leadId) return Response.json({ error: 'leadId es requerido' }, { status: 400 })

    const { data, error } = await supabase.from('interacciones')
      .select('id, resultado, nota, created_at, canales(nombre)')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })
    if (error) throw error

    return Response.json(data.map(i => ({ id: i.id, canal: i.canales?.nombre || 'Desconocido', resultado: i.resultado, nota: i.nota, fecha: i.created_at })))
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
