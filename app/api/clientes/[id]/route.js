import { supabase } from '@/lib/supabase'

export async function GET(request, { params }) {
  try {
    const { id } = await params

    const { data, error } = await supabase
      .from('clientes')
      .select(`
        *,
        leads (
          nombre, apellido, email, telefono, localidad_id,
          generos (descripcion),
          localidades (nombre),
          lead_cursos (prioridad, cursos (id, nombre)),
          historial_estado_lead (cambiado_por, created_at, estados_lead (nombre)),
          interacciones (id, resultado, nota, created_at)
        )
      `)
      .eq('id', id)
      .single()

    if (error) return Response.json({ error: 'Cliente no encontrado' }, { status: 404 })

    const lead = data.leads || {}
    const cursos = (lead.lead_cursos || [])
      .sort((a, b) => a.prioridad - b.prioridad)
      .map(lc => ({ id: lc.cursos?.id, nombre: lc.cursos?.nombre }))
      .filter(c => c.nombre)

    const historialEstados = (lead.historial_estado_lead || [])
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map(h => ({ estado: h.estados_lead?.nombre || 'Desconocido', fecha: h.created_at, cambiadoPor: h.cambiado_por }))

    const interacciones = (lead.interacciones || [])
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10)
      .map(i => ({ id: i.id, resultado: i.resultado, nota: i.nota, fecha: i.created_at }))

    return Response.json({
      id: data.id,
      leadId: data.lead_id,
      nombre: lead.nombre || '',
      apellido: lead.apellido || '',
      email: lead.email || '',
      telefono: lead.telefono || '',
      genero: lead.generos?.descripcion || '',
      localidad: lead.localidades?.nombre || '',
      localidadId: lead.localidad_id,
      fechaAlta: data.fecha_alta,
      estadoCliente: data.estado_cliente || 'activo',
      createdAt: data.created_at,
      cursos,
      historialEstados,
      interacciones,
      stats: {
        totalInteracciones: interacciones.length,
        diasComoCliente: data.fecha_alta
          ? Math.floor((new Date() - new Date(data.fecha_alta)) / (1000 * 60 * 60 * 24))
          : 0
      }
    })
  } catch (error) {
    console.error('Error en GET /api/clientes/[id]:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const { estadoCliente } = await request.json()

    const estadosValidos = ['activo', 'inactivo', 'egresado', 'suspendido']
    if (estadoCliente && !estadosValidos.includes(estadoCliente)) {
      return Response.json({ error: `Estado inválido. Debe ser uno de: ${estadosValidos.join(', ')}` }, { status: 400 })
    }

    const { error } = await supabase
      .from('clientes')
      .update({ estado_cliente: estadoCliente })
      .eq('id', id)

    if (error) throw error
    return Response.json({ success: true, message: 'Cliente actualizado', estadoCliente })
  } catch (error) {
    console.error('Error en PUT /api/clientes/[id]:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    const [{ data: cliente, error: fetchError }, { data: estadoContactado }] = await Promise.all([
      supabase.from('clientes').select('lead_id').eq('id', id).single(),
      supabase.from('estados_lead').select('id').eq('nombre', 'contactado').single()
    ])

    if (fetchError) return Response.json({ error: 'Cliente no encontrado' }, { status: 404 })

    if (estadoContactado && cliente.lead_id) {
      await supabase.from('historial_estado_lead').insert({
        lead_id: cliente.lead_id,
        estado_id: estadoContactado.id,
        cambiado_por: 'sistema',
        created_at: new Date().toISOString()
      })
    }

    const { error: deleteError } = await supabase.from('clientes').delete().eq('id', id)
    if (deleteError) throw deleteError

    return Response.json({ success: true, message: 'Cliente eliminado. El lead se mantiene en el sistema.', leadId: cliente.lead_id })
  } catch (error) {
    console.error('Error en DELETE /api/clientes/[id]:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
