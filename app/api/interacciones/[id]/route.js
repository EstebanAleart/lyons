import { supabase } from '@/lib/supabase'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const { data, error } = await supabase.from('interacciones').select('*').eq('id', id).single()
    if (error) return Response.json({ error: 'Interacción no encontrada' }, { status: 404 })
    return Response.json({ id: data.id, leadId: data.lead_id, nota: data.nota, resultado: data.resultado, canalId: data.canal_id, usuarioId: data.usuario_id, createdAt: data.created_at, updatedAt: data.updated_at })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const { nota, usuarioId } = await request.json()

    const update = { updated_at: new Date().toISOString() }
    if (nota !== undefined) update.nota = nota
    if (usuarioId !== undefined) update.usuario_id = usuarioId

    const { error } = await supabase.from('interacciones').update(update).eq('id', id)
    if (error) throw error
    return Response.json({ success: true, message: 'Interacción actualizada' })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    const { error } = await supabase.from('interacciones').delete().eq('id', id)
    if (error) throw error
    return Response.json({ success: true, message: 'Interacción eliminada' })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
