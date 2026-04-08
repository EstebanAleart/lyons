import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase.rpc('get_canal_metrics')
    if (error) throw error

    const result = data.map(c => ({
      canal: c.canal,
      total: parseInt(c.total, 10),
      contactados: parseInt(c.contactados, 10),
      convertidos: parseInt(c.convertidos, 10),
      tasaConversion: c.total > 0 ? ((c.convertidos / c.total) * 100).toFixed(1) : 0
    }))

    return Response.json(result)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
