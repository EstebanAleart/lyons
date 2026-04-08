import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase.rpc('get_cursos_with_count')
    if (error) throw error
    return Response.json(data)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { nombre, descripcion = null } = await request.json()

    if (!nombre?.trim()) {
      return Response.json({ error: 'El nombre es requerido' }, { status: 400 })
    }

    const { data: existente } = await supabase
      .from('cursos')
      .select('id')
      .eq('nombre', nombre.trim())
      .single()

    if (existente) {
      return Response.json({ error: 'Ya existe un curso con ese nombre' }, { status: 409 })
    }

    const { data, error } = await supabase
      .from('cursos')
      .insert({ nombre: nombre.trim(), descripcion, activo: true })
      .select()
      .single()

    if (error) throw error
    return Response.json(data, { status: 201 })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
