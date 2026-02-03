// app/api/leads/[id]/etapa/route.js
// API para cambiar la etapa de un lead

import { Lead, EstadoLead, HistorialEstadoLead } from '@/lib/models';

// PUT - Cambiar etapa del lead
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { etapa, cambiadoPor } = body;

    if (!etapa) {
      return Response.json({ error: 'La etapa es requerida' }, { status: 400 });
    }

    const lead = await Lead.findByPk(id);
    
    if (!lead) {
      return Response.json({ error: 'Lead no encontrado' }, { status: 404 });
    }

    // Buscar o crear el estado
    let estadoLead = await EstadoLead.findOne({ 
      where: { nombre: etapa.toLowerCase() } 
    });

    if (!estadoLead) {
      // Si no existe, crearlo
      estadoLead = await EstadoLead.create({
        nombre: etapa.toLowerCase()
      });
    }

    // Verificar si ya existe un registro con este estado para evitar duplicados
    const ultimoHistorial = await HistorialEstadoLead.findOne({
      where: { lead_id: id },
      order: [['created_at', 'DESC']],
      include: [{ model: EstadoLead, attributes: ['nombre'] }]
    });

    // Si el último estado es el mismo, no hacer nada
    if (ultimoHistorial?.EstadoLead?.nombre === etapa.toLowerCase()) {
      return Response.json({ 
        message: 'El lead ya está en esta etapa',
        etapa: etapa.toLowerCase()
      });
    }

    // Crear registro en historial
    await HistorialEstadoLead.create({
      lead_id: id,
      estado_id: estadoLead.id,
      cambiado_por: cambiadoPor || 'Sistema',
      created_at: new Date()
    });

    // Actualizar fecha de modificación del lead
    await lead.update({
      updated_at: new Date()
    });

    return Response.json({ 
      success: true,
      message: 'Etapa actualizada exitosamente',
      etapa: etapa.toLowerCase(),
      leadId: id
    });
    
  } catch (error) {
    console.error('Error al cambiar etapa:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// GET - Obtener todas las etapas disponibles
export async function GET() {
  try {
    const etapas = await EstadoLead.findAll({
      order: [['nombre', 'ASC']]
    });

    // Si no hay etapas, devolver las predeterminadas
    const etapasPredeterminadas = ['nuevo', 'contactado', 'interesado', 'negociando', 'convertido', 'perdido'];
    
    if (etapas.length === 0) {
      return Response.json(etapasPredeterminadas.map(e => ({ id: e, nombre: e })));
    }

    return Response.json(etapas.map(e => ({
      id: e.id,
      nombre: e.nombre
    })));
  } catch (error) {
    console.error('Error al obtener etapas:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
