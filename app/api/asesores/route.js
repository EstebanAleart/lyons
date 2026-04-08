import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase.rpc('get_asesores_performance')
    if (error) throw error

    const result = data.map(u => ({
      id: u.id,
      asesor: u.asesor,
      contactos: parseInt(u.contactos, 10),
      conversiones: parseInt(u.conversiones, 10),
      leadsAsignados: parseInt(u.leads_asignados, 10),
      tasaConversion: u.leads_asignados > 0
        ? Math.round((u.conversiones / u.leads_asignados) * 100)
        : 0
    }))

    return Response.json(result)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
