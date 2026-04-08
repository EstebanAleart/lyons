import { supabase } from '@/lib/supabase'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const { data, error } = await supabase
      .from('lead_cursos')
      .select('id, curso_id, prioridad, cursos(id, nombre, descripcion, activo)')
      .eq('lead_id', id)
      .order('prioridad')
    if (error) throw error

    return Response.json(data.map(lc => ({ id: lc.id, cursoId: lc.curso_id, curso: lc.cursos?.nombre || 'Curso desconocido', descripcion: lc.cursos?.descripcion, prioridad: lc.prioridad, activo: lc.cursos?.activo })))
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = await params
    const { cursoId, prioridad } = await request.json()
    if (!cursoId) return Response.json({ error: 'cursoId es requerido' }, { status: 400 })

    const [{ data: lead }, { data: curso }, { data: existente }] = await Promise.all([
      supabase.from('leads').select('id').eq('id', id).single(),
      supabase.from('cursos').select('id, nombre').eq('id', cursoId).single(),
      supabase.from('lead_cursos').select('id').eq('lead_id', id).eq('curso_id', cursoId).single()
    ])
    if (!lead) return Response.json({ error: 'Lead no encontrado' }, { status: 404 })
    if (!curso) return Response.json({ error: 'Curso no encontrado' }, { status: 404 })
    if (existente) return Response.json({ error: 'El lead ya tiene este curso asignado' }, { status: 400 })

    const { data: maxRow, error: maxError } = await supabase.from('lead_cursos').select('prioridad').eq('lead_id', id).order('prioridad', { ascending: false }).limit(1).single()
    if (maxError && maxError.code !== 'PGRST116') throw maxError
    const nuevaPrioridad = prioridad || (maxRow ? maxRow.prioridad + 1 : 1)

    const { data: leadCurso, error } = await supabase.from('lead_cursos').insert({ lead_id: id, curso_id: cursoId, prioridad: nuevaPrioridad }).select().single()
    if (error) throw error

    return Response.json({ success: true, leadCurso: { id: leadCurso.id, cursoId: leadCurso.curso_id, curso: curso.nombre, prioridad: leadCurso.prioridad } })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    const leadCursoId = new URL(request.url).searchParams.get('leadCursoId')
    if (!leadCursoId) return Response.json({ error: 'leadCursoId es requerido' }, { status: 400 })

    const { error } = await supabase.from('lead_cursos').delete().eq('id', leadCursoId).eq('lead_id', id)
    if (error) throw error
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
