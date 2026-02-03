// app/api/ultimos-contactos/route.js
// API para obtener las últimas interacciones/contactos con leads

import { Interaccion, Lead, Canal, Usuario, Localidad, LeadCurso, Curso, HistorialEstadoLead, EstadoLead } from '@/lib/models';
import { Op } from 'sequelize';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const dias = parseInt(searchParams.get('dias') || '30', 10); // Filtrar por últimos X días

    // Calcular fecha límite
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - dias);

    // Obtener total
    const total = await Interaccion.count({
      where: {
        created_at: { [Op.gte]: fechaLimite }
      }
    });

    // Obtener interacciones recientes con info del lead
    const interacciones = await Interaccion.findAll({
      where: {
        created_at: { [Op.gte]: fechaLimite }
      },
      include: [
        { 
          model: Lead,
          include: [
            { model: Localidad, attributes: ['nombre'] },
            { 
              model: LeadCurso, 
              include: [{ model: Curso, attributes: ['nombre'] }],
              limit: 1
            },
            {
              model: HistorialEstadoLead,
              include: [{ model: EstadoLead, attributes: ['nombre'] }],
              order: [['created_at', 'DESC']],
              limit: 1,
              separate: true
            }
          ]
        },
        { model: Canal, attributes: ['nombre'] },
        { model: Usuario, attributes: ['nombre'] }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    // Formatear datos
    const contactosFormateados = interacciones.map(i => {
      const data = i.toJSON();
      const lead = data.Lead || {};
      const curso = lead.LeadCursos?.[0]?.Curso?.nombre || '-';
      const etapaActual = lead.HistorialEstadoLeads?.[0]?.EstadoLead?.nombre || 'nuevo';

      return {
        id: data.id,
        // Info de la interacción
        canal: data.Canal?.nombre || '-',
        resultado: data.resultado || '-',
        nota: data.nota || '',
        fecha: data.created_at,
        usuario: data.Usuario?.nombre || '-',
        // Info del lead
        leadId: data.lead_id,
        nombre: `${lead.nombre || ''} ${lead.apellido || ''}`.trim(),
        email: lead.email || '',
        telefono: lead.telefono || '',
        localidad: lead.Localidad?.nombre || '-',
        curso,
        etapa: etapaActual,
        // Días desde el contacto
        diasDesdeContacto: Math.floor((new Date() - new Date(data.created_at)) / (1000 * 60 * 60 * 24))
      };
    });

    return Response.json({
      contactos: contactosFormateados,
      total,
      offset,
      limit,
      hasMore: offset + interacciones.length < total
    });
  } catch (error) {
    console.error('Error en /api/ultimos-contactos:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
