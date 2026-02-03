// app/api/clientes/[id]/route.js
// API Route para obtener, actualizar y eliminar un cliente específico
import { Cliente, Lead, Genero, Localidad, LeadCurso, Curso, HistorialEstadoLead, EstadoLead, Interaccion } from '@/lib/models'

// GET - Obtener cliente por ID
export async function GET(request, { params }) {
  try {
    const { id } = await params

    const cliente = await Cliente.findByPk(id, {
      include: [
        {
          model: Lead,
          include: [
            { model: Genero, attributes: ['descripcion'] },
            { model: Localidad, attributes: ['id', 'nombre'] },
            { 
              model: LeadCurso, 
              include: [{ model: Curso, attributes: ['id', 'nombre'] }] 
            },
            {
              model: HistorialEstadoLead,
              include: [{ model: EstadoLead, attributes: ['nombre'] }]
            },
            {
              model: Interaccion
            }
          ]
        }
      ]
    })

    if (!cliente) {
      return Response.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    const data = cliente.toJSON()
    const lead = data.Lead || {}
    
    // Obtener cursos del lead
    const cursos = lead.LeadCursos?.map(lc => ({
      id: lc.Curso?.id,
      nombre: lc.Curso?.nombre
    })).filter(c => c.nombre) || []

    // Formatear historial de estados (ordenar por fecha desc)
    const historialEstados = (lead.HistorialEstadoLeads || [])
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map(h => ({
        estado: h.EstadoLead?.nombre || 'Desconocido',
        fecha: h.created_at,
        cambiadoPor: h.cambiado_por
      }))

    // Formatear interacciones (ordenar por fecha desc, limitar a 10)
    const interacciones = (lead.Interaccions || [])
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10)
      .map(i => ({
        id: i.id,
        resultado: i.resultado,
        nota: i.nota,
        fecha: i.created_at
      }))

    return Response.json({
      id: data.id,
      leadId: data.lead_id,
      nombre: lead.nombre || '',
      apellido: lead.apellido || '',
      email: lead.email || '',
      telefono: lead.telefono || '',
      genero: lead.Genero?.descripcion || '',
      localidad: lead.Localidad?.nombre || '',
      localidadId: lead.localidad_id,
      fechaAlta: data.fecha_alta,
      estadoCliente: data.estado_cliente || 'activo',
      createdAt: data.created_at,
      cursos,
      historialEstados,
      interacciones,
      // Stats
      stats: {
        totalInteracciones: interacciones.length,
        diasComoCliente: data.fecha_alta ? Math.floor((new Date() - new Date(data.fecha_alta)) / (1000 * 60 * 60 * 24)) : 0
      }
    })
  } catch (error) {
    console.error('Error en GET /api/clientes/[id]:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Actualizar estado del cliente
export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { estadoCliente } = body

    const cliente = await Cliente.findByPk(id)

    if (!cliente) {
      return Response.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    // Validar estado
    const estadosValidos = ['activo', 'inactivo', 'egresado', 'suspendido']
    if (estadoCliente && !estadosValidos.includes(estadoCliente)) {
      return Response.json({ 
        error: `Estado inválido. Debe ser uno de: ${estadosValidos.join(', ')}` 
      }, { status: 400 })
    }

    await cliente.update({
      estado_cliente: estadoCliente
    })

    return Response.json({ 
      success: true, 
      message: 'Cliente actualizado',
      estadoCliente: cliente.estado_cliente
    })
  } catch (error) {
    console.error('Error en PUT /api/clientes/[id]:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Eliminar cliente (vuelve a ser solo lead)
export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    const cliente = await Cliente.findByPk(id)

    if (!cliente) {
      return Response.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    const leadId = cliente.lead_id

    // Actualizar el historial del lead - cambiar estado a "contactado" o similar
    const estadoContactado = await EstadoLead.findOne({ 
      where: { nombre: 'contactado' } 
    })

    if (estadoContactado && leadId) {
      await HistorialEstadoLead.create({
        lead_id: leadId,
        estado_id: estadoContactado.id,
        cambiado_por: 'sistema',
        created_at: new Date()
      })
    }

    // Eliminar el registro de cliente
    await cliente.destroy()

    return Response.json({ 
      success: true, 
      message: 'Cliente eliminado. El lead se mantiene en el sistema.',
      leadId
    })
  } catch (error) {
    console.error('Error en DELETE /api/clientes/[id]:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
