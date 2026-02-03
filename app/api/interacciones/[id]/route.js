// app/api/interacciones/[id]/route.js
// API Route para actualizar una interacción específica

import { Interaccion } from '@/lib/models'

// PUT - Actualizar interacción (nota, usuario, etc.)
export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { nota, usuarioId } = body

    const interaccion = await Interaccion.findByPk(id)

    if (!interaccion) {
      return Response.json({ error: 'Interacción no encontrada' }, { status: 404 })
    }

    await interaccion.update({
      nota: nota !== undefined ? nota : interaccion.nota,
      usuario_id: usuarioId !== undefined ? usuarioId : interaccion.usuario_id,
      updated_at: new Date()
    })

    return Response.json({ 
      success: true, 
      message: 'Interacción actualizada',
      interaccion: {
        id: interaccion.id,
        nota: interaccion.nota,
        updated_at: interaccion.updated_at
      }
    })
  } catch (error) {
    console.error('Error en PUT /api/interacciones/[id]:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

// GET - Obtener una interacción específica
export async function GET(request, { params }) {
  try {
    const { id } = await params

    const interaccion = await Interaccion.findByPk(id)

    if (!interaccion) {
      return Response.json({ error: 'Interacción no encontrada' }, { status: 404 })
    }

    return Response.json({
      id: interaccion.id,
      leadId: interaccion.lead_id,
      nota: interaccion.nota,
      resultado: interaccion.resultado,
      canalId: interaccion.canal_id,
      usuarioId: interaccion.usuario_id,
      createdAt: interaccion.created_at,
      updatedAt: interaccion.updated_at
    })
  } catch (error) {
    console.error('Error en GET /api/interacciones/[id]:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Eliminar una interacción
export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    const interaccion = await Interaccion.findByPk(id)

    if (!interaccion) {
      return Response.json({ error: 'Interacción no encontrada' }, { status: 404 })
    }

    await interaccion.destroy()

    return Response.json({ 
      success: true, 
      message: 'Interacción eliminada'
    })
  } catch (error) {
    console.error('Error en DELETE /api/interacciones/[id]:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
