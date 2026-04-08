import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase.rpc('get_funnel_data')
    if (error) throw error

    const total = data.reduce((acc, e) => acc + parseInt(e.cantidad, 10), 0)
    const funnel = data.map(e => ({
      estado: e.estado,
      cantidad: parseInt(e.cantidad, 10),
      porcentaje: total > 0 ? Math.round((parseInt(e.cantidad, 10) / total) * 100) : 0
    }))

    return Response.json(funnel)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
