import { supabase } from '@/lib/supabase'

export async function POST(request, { params }) {
  try {
    const { id } = await params

    const [{ data: lead }, { data: clienteExistente }, { data: estadoConvertido }] = await Promise.all([
      supabase.from('leads').select('id').eq('id', id).single(),
      supabase.from('clientes').select('id').eq('lead_id', id).single(),
      supabase.from('estados_lead').select('id').eq('nombre', 'convertido').single()
    ])

    if (!lead) return Response.json({ error: 'Lead no encontrado' }, { status: 404 })
    if (clienteExistente) return Response.json({ error: 'Este lead ya fue convertido a cliente', clienteId: clienteExistente.id }, { status: 400 })

    const now = new Date().toISOString()
    const { data: cliente, error } = await supabase.from('clientes')
      .insert({ lead_id: id, fecha_alta: now, estado_cliente: 'activo', created_at: now })
      .select('id').single()
    if (error) throw error

    if (estadoConvertido) {
      await supabase.from('historial_estado_lead').insert({ lead_id: id, estado_id: estadoConvertido.id, cambiado_por: 'sistema', created_at: now })
    }

    return Response.json({ success: true, clienteId: cliente.id, message: 'Lead convertido a cliente exitosamente' }, { status: 201 })
  } catch (error) {
    console.error('Error al convertir lead:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
