import { supabase } from '@/lib/supabase'

export async function GET(request) {
  try {
    const soloActivos = new URL(request.url).searchParams.get('activos') !== 'false'

    let query = supabase.from('usuarios').select('id, nombre, email, rol, activo').order('nombre')
    if (soloActivos) query = query.eq('activo', true)

    const { data, error } = await query
    if (error) throw error
    return Response.json(data)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
