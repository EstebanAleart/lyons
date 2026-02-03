// app/api/leads/[id]/estados/route.js
// API para gestionar historial de estados de un lead

import { Lead, HistorialEstadoLead, EstadoLead, Usuario } from '@/lib/models';
import { v4 as uuidv4 } from 'uuid';

// GET: Obtener historial de estados del lead
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const historial = await HistorialEstadoLead.findAll({
      where: { lead_id: id },
      include: [
        {
          model: EstadoLead,
          attributes: ['id', 'nombre', 'descripcion'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    const result = historial.map(h => ({
      id: h.id,
      estadoId: h.estado_id,
      estado: h.EstadoLead?.nombre || 'Desconocido',
      descripcion: h.EstadoLead?.descripcion,
      fecha: h.created_at,
      cambiadoPor: h.cambiado_por || null,
    }));

    return Response.json(result);
  } catch (error) {
    console.error('Error al obtener historial de estados:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// POST: Cambiar estado del lead
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { estadoId, cambiadoPor } = body;

    if (!estadoId) {
      return Response.json({ error: 'estadoId es requerido' }, { status: 400 });
    }

    // Verificar que el lead existe
    const lead = await Lead.findByPk(id);
    if (!lead) {
      return Response.json({ error: 'Lead no encontrado' }, { status: 404 });
    }

    // Verificar que el estado existe
    const estado = await EstadoLead.findByPk(estadoId);
    if (!estado) {
      return Response.json({ error: 'Estado no encontrado' }, { status: 404 });
    }

    // Crear el registro en el historial
    const now = new Date();
    const historialEntry = await HistorialEstadoLead.create({
      id: uuidv4(),
      lead_id: id,
      estado_id: estadoId,
      cambiado_por: cambiadoPor || null,
      created_at: now,
    });

    return Response.json({
      success: true,
      historial: {
        id: historialEntry.id,
        estadoId: historialEntry.estado_id,
        estado: estado.nombre,
        fecha: historialEntry.created_at,
        cambiadoPor: historialEntry.cambiado_por,
      },
    });
  } catch (error) {
    console.error('Error al cambiar estado del lead:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
