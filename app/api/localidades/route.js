import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase.from('localidades').select('id, nombre, region, pais').order('nombre')
    if (error) throw error
    return Response.json(data)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { nombre, region = null, pais = 'Uruguay' } = await request.json()
    if (!nombre?.trim()) return Response.json({ error: 'El nombre es requerido' }, { status: 400 })

    const { data: existente } = await supabase.from('localidades').select('id').eq('nombre', nombre.trim()).single()
    if (existente) return Response.json({ error: 'Ya existe una localidad con ese nombre' }, { status: 409 })

    const { data, error } = await supabase.from('localidades').insert({ nombre: nombre.trim(), region, pais }).select().single()
    if (error) throw error
    return Response.json(data)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
