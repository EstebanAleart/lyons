import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase.from('origenes').select('id, nombre').order('nombre')
    if (error) throw error
    return Response.json(data)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
