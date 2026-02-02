// app/api/estados-lead/route.js
// API para obtener lista de estados disponibles para leads

import { EstadoLead } from '@/lib/models';

export async function GET(request) {
  try {
    const estados = await EstadoLead.findAll({
      attributes: ['id', 'nombre', 'descripcion'],
      order: [['nombre', 'ASC']],
    });

    return Response.json(estados);
  } catch (error) {
    console.error('Error al obtener estados:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
