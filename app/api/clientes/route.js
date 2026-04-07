import { supabase } from '@/lib/supabase'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    const limit = parseInt(searchParams.get('limit') || '500', 10)

    const { data, error } = await supabase.rpc('get_clientes_list', {
      p_limit: limit,
      p_offset: offset
    })
    if (error) throw error

    const total = data[0]?.total_count ? parseInt(data[0].total_count) : 0
    const clientesFormateados = data.map(c => ({
      id: c.id,
      leadId: c.lead_id,
      nombre: c.nombre || '',
      email: c.email || '',
      telefono: c.telefono || '',
      genero: c.genero || '',
      localidad: c.localidad || '',
      curso: c.curso || '-',
      fechaAlta: c.fecha_alta ? new Date(c.fecha_alta).toISOString().split('T')[0] : '-',
      estadoCliente: c.estado_cliente || 'activo',
      createdAt: c.created_at ? new Date(c.created_at).toISOString().split('T')[0] : '-'
    }))

    return Response.json({
      clientes: clientesFormateados,
      total,
      offset,
      limit,
      hasMore: offset + data.length < total
    })
  } catch (error) {
    console.error('Error en /api/clientes:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
