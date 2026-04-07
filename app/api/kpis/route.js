import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const [
      { count: totalLeads },
      { data: tocados },
      { count: totalClientes },
      { data: vencidos }
    ] = await Promise.all([
      supabase.from('leads').select('*', { count: 'exact', head: true }),
      supabase.rpc('get_leads_tocados_count'),
      supabase.from('clientes').select('*', { count: 'exact', head: true }),
      supabase.rpc('get_leads_vencidos_count'),
    ])

    const leadsTocados = parseInt(tocados || 0)
    const leadsVencidos = parseInt(vencidos || 0)

    const tasaContacto = totalLeads > 0 ? ((leadsTocados / totalLeads) * 100).toFixed(1) : 0
    const tasaConversion = totalLeads > 0 ? ((totalClientes / totalLeads) * 100).toFixed(1) : 0

    return Response.json({
      totalLeads,
      tasaContacto: `${tasaContacto}%`,
      tasaConversion: `${tasaConversion}%`,
      leadsVencidos
    })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
