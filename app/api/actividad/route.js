import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const [{ data: leadsPorDia }, { data: conversionesPorDia }] = await Promise.all([
      supabase.rpc('get_actividad_leads'),
      supabase.rpc('get_actividad_conversiones'),
    ])

    const actividad = []
    for (let i = 13; i >= 0; i--) {
      const fecha = new Date()
      fecha.setDate(fecha.getDate() - i)
      const fechaStr = fecha.toISOString().split('T')[0]
      const dia = fecha.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric' })

      const nuevosData = leadsPorDia?.find(l => l.fecha === fechaStr)
      const convertidosData = conversionesPorDia?.find(c => c.fecha === fechaStr)

      actividad.push({
        dia,
        fecha: fechaStr,
        nuevos: parseInt(nuevosData?.nuevos || 0),
        reactivados: 0,
        convertidos: parseInt(convertidosData?.convertidos || 0)
      })
    }

    return Response.json(actividad)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
