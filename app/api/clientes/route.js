// app/api/clientes/route.js
// API Route para obtener clientes desde la DB con paginación
import { Cliente, Lead, Genero, Localidad, LeadCurso, Curso } from '@/lib/models'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '500', 10);

    // Obtener total de clientes
    const total = await Cliente.count();

    // Obtener chunk de clientes
    const clientes = await Cliente.findAll({
      include: [
        {
          model: Lead,
          include: [
            { model: Genero, attributes: ['descripcion'] },
            { model: Localidad, attributes: ['nombre'] },
            { model: LeadCurso, include: [{ model: Curso, attributes: ['nombre'] }] }
          ]
        }
      ],
      order: [['fecha_alta', 'DESC'], ['id', 'ASC']],
      offset,
      limit
    });

    // Formatear datos para el frontend
    const clientesFormateados = clientes.map(c => {
      const cliente = c.toJSON();
      
      // Obtener cursos del lead
      const cursos = cliente.Lead?.LeadCursos?.map(lc => lc.Curso?.nombre).filter(Boolean) || [];
      const curso = cursos[0] || '-';

      return {
        id: cliente.id,
        leadId: cliente.lead_id,
        nombre: `${cliente.Lead?.nombre || ''} ${cliente.Lead?.apellido || ''}`.trim(),
        email: cliente.Lead?.email || '',
        telefono: cliente.Lead?.telefono || '',
        genero: cliente.Lead?.Genero?.descripcion || '',
        localidad: cliente.Lead?.Localidad?.nombre || '',
        curso,
        fechaAlta: cliente.fecha_alta ? new Date(cliente.fecha_alta).toISOString().split('T')[0] : '-',
        estadoCliente: cliente.estado_cliente || 'activo',
        createdAt: cliente.created_at ? new Date(cliente.created_at).toISOString().split('T')[0] : '-'
      };
    });

    const hasMore = offset + clientes.length < total;

    return Response.json({
      clientes: clientesFormateados,
      total,
      offset,
      limit,
      hasMore
    });
  } catch (error) {
    console.error('Error en /api/clientes:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
