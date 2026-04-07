import { supabase } from '@/lib/supabase'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const offset = parseInt(searchParams.get('offset') || '0')
    const limit = parseInt(searchParams.get('limit') || '500')

    const { data, error } = await supabase.rpc('get_leads_vencidos', {
      p_limit: limit,
      p_offset: offset
    })
    if (error) throw error

    const total = data[0]?.total_count ? parseInt(data[0].total_count) : 0
    const result = data.map(l => ({
      id: l.id,
      nombre: l.nombre,
      apellido: l.apellido,
      email: l.email,
      telefono: l.telefono,
      ultimoContacto: l.ultimo_contacto,
      diasSinContacto: l.dias_sin_contacto ? Math.round(l.dias_sin_contacto) : 999,
      estado: l.estado || 'nuevo',
      ultimoComentario: l.ultimo_comentario || null,
      ultimoCanal: l.ultimo_canal || null
    }))

    return Response.json({
      leadsVencidos: result,
      total,
      offset,
      limit,
      hasMore: offset + result.length < total
    })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
