import { supabase } from '@/lib/supabase'

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const { etapa, cambiadoPor } = await request.json()

    if (!etapa) return Response.json({ error: 'La etapa es requerida' }, { status: 400 })

    const etapaNorm = etapa.toLowerCase()

    let { data: estadoLead } = await supabase.from('estados_lead').select('id').eq('nombre', etapaNorm).single()
    if (!estadoLead) {
      const { data: nuevo } = await supabase.from('estados_lead').insert({ nombre: etapaNorm }).select('id').single()
      estadoLead = nuevo
    }

    const { data: ultimo } = await supabase.from('historial_estado_lead').select('estado_id, estados_lead(nombre)').eq('lead_id', id).order('created_at', { ascending: false }).limit(1).single()
    if (ultimo?.estados_lead?.nombre === etapaNorm) {
      return Response.json({ message: 'El lead ya está en esta etapa', etapa: etapaNorm })
    }

    await Promise.all([
      supabase.from('historial_estado_lead').insert({ lead_id: id, estado_id: estadoLead.id, cambiado_por: cambiadoPor || 'Sistema', created_at: new Date().toISOString() }),
      supabase.from('leads').update({ updated_at: new Date().toISOString() }).eq('id', id)
    ])

    return Response.json({ success: true, message: 'Etapa actualizada exitosamente', etapa: etapaNorm, leadId: id })
  } catch (error) {
    console.error('Error al cambiar etapa:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { data: etapas } = await supabase.from('estados_lead').select('id, nombre').order('nombre')
    if (!etapas?.length) {
      return Response.json(['nuevo', 'contactado', 'interesado', 'negociando', 'convertido', 'perdido'].map(e => ({ id: e, nombre: e })))
    }
    return Response.json(etapas)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
