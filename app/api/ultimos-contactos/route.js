import { supabase } from '@/lib/supabase'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const dias = parseInt(searchParams.get('dias') || '30')

    const { data, error } = await supabase.rpc('get_ultimos_contactos', {
      p_limit: limit,
      p_offset: offset,
      p_dias: dias
    })
    if (error) throw error

    const total = data[0]?.total_count ? parseInt(data[0].total_count) : 0
    const contactosFormateados = data.map(i => ({
      id: i.id,
      canal: i.canal || '-',
      resultado: i.resultado || '-',
      nota: i.nota || '',
      fecha: i.fecha,
      usuario: i.usuario || '-',
      leadId: i.lead_id,
      nombre: i.nombre || '',
      email: i.email || '',
      telefono: i.telefono || '',
      localidad: i.localidad || '-',
      curso: i.curso || '-',
      etapa: i.etapa || 'nuevo',
      diasDesdeContacto: Math.floor((new Date() - new Date(i.fecha)) / (1000 * 60 * 60 * 24))
    }))

    return Response.json({
      contactos: contactosFormateados,
      total,
      offset,
      limit,
      hasMore: offset + data.length < total
    })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
