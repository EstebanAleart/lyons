import { supabase } from '@/lib/supabase'

export async function GET(request, { params }) {
  try {
    const { id } = await params

    const [
      { data: lead, error },
      { data: interacciones },
      { data: historialEstados },
      { data: cursosInteres }
    ] = await Promise.all([
      supabase.from('leads').select('*, generos(codigo,descripcion), localidades(nombre,region,pais), origenes(nombre), clientes(id,fecha_alta,estado_cliente,created_at)').eq('id', id).single(),
      supabase.from('interacciones').select('*, canales(nombre), usuarios(nombre,email)').eq('lead_id', id).order('created_at', { ascending: false }),
      supabase.from('historial_estado_lead').select('*, estados_lead(nombre)').eq('lead_id', id).order('created_at', { ascending: false }),
      supabase.from('lead_cursos').select('*, cursos(nombre,activo)').eq('lead_id', id).order('prioridad', { ascending: true })
    ])

    if (error) return Response.json({ error: 'Lead no encontrado' }, { status: 404 })

    return Response.json({
      id: lead.id,
      nombre: lead.nombre,
      apellido: lead.apellido,
      telefono: lead.telefono,
      email: lead.email,
      genero: lead.generos?.descripcion || lead.generos?.codigo || null,
      localidad: lead.localidades ? { nombre: lead.localidades.nombre, region: lead.localidades.region, pais: lead.localidades.pais } : null,
      origen: lead.origenes?.nombre || null,
      createdAt: lead.created_at,
      updatedAt: lead.updated_at,
      cliente: lead.clientes ? { id: lead.clientes.id, fechaAlta: lead.clientes.fecha_alta, estado: lead.clientes.estado_cliente } : null,
      interacciones: (interacciones || []).map(i => ({ id: i.id, canal: i.canales?.nombre || 'Desconocido', resultado: i.resultado, nota: i.nota, fecha: i.created_at, usuario: i.usuarios ? { nombre: i.usuarios.nombre, email: i.usuarios.email } : null })),
      historialEstados: (historialEstados || []).map(h => ({ id: h.id, estado: h.estados_lead?.nombre || 'Desconocido', cambiadoPor: h.cambiado_por, fecha: h.created_at })),
      cursosInteres: (cursosInteres || []).map(c => ({ id: c.id, curso: c.cursos?.nombre || 'Desconocido', activo: c.cursos?.activo, prioridad: c.prioridad })),
      stats: { totalInteracciones: interacciones?.length || 0, ultimaInteraccion: interacciones?.[0]?.created_at || null, estadoActual: historialEstados?.[0]?.estados_lead?.nombre || 'nuevo', esCliente: !!lead.clientes }
    })
  } catch (error) {
    console.error('Error al obtener lead:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { nombre, apellido, email, telefono, localidadId, origenId, cursoId } = body

    if (Object.prototype.hasOwnProperty.call(body, 'nombre') && !nombre?.trim()) {
      return Response.json({ error: 'El nombre es obligatorio' }, { status: 400 })
    }

    const updateFields = { updated_at: new Date().toISOString() }
    if (Object.prototype.hasOwnProperty.call(body, 'nombre')) updateFields.nombre = nombre.trim()
    if (Object.prototype.hasOwnProperty.call(body, 'apellido')) updateFields.apellido = apellido?.trim() || null
    if (Object.prototype.hasOwnProperty.call(body, 'email')) updateFields.email = email?.trim() || null
    if (Object.prototype.hasOwnProperty.call(body, 'telefono')) updateFields.telefono = telefono?.trim() || null
    if (Object.prototype.hasOwnProperty.call(body, 'localidadId')) updateFields.localidad_id = localidadId || null
    if (Object.prototype.hasOwnProperty.call(body, 'origenId')) updateFields.origen_id = origenId || null

    const { error } = await supabase.from('leads').update(updateFields).eq('id', id)
    if (error) throw error

    if (cursoId) {
      const { data: existing } = await supabase.from('lead_cursos').select('id').eq('lead_id', id).limit(1).single()
      if (existing) {
        await supabase.from('lead_cursos').update({ curso_id: cursoId }).eq('id', existing.id)
      } else {
        await supabase.from('lead_cursos').insert({ lead_id: id, curso_id: cursoId, prioridad: 1 })
      }
    }

    return Response.json({ id, message: 'Lead actualizado exitosamente' })
  } catch (error) {
    console.error('Error al actualizar lead:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    await Promise.all([
      supabase.from('lead_cursos').delete().eq('lead_id', id),
      supabase.from('historial_estado_lead').delete().eq('lead_id', id),
      supabase.from('interacciones').delete().eq('lead_id', id),
    ])

    const { error } = await supabase.from('leads').delete().eq('id', id)
    if (error) throw error

    return Response.json({ message: 'Lead eliminado exitosamente' })
  } catch (error) {
    console.error('Error al eliminar lead:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
