// app/api/leads/[id]/convertir/route.js
// API para convertir un lead a cliente

import { Lead, Cliente, HistorialEstadoLead, EstadoLead } from '@/lib/models';

export async function POST(request, { params }) {
  try {
    const { id } = await params;

    // Verificar que el lead existe
    const lead = await Lead.findByPk(id);
    if (!lead) {
      return Response.json({ error: 'Lead no encontrado' }, { status: 404 });
    }

    // Verificar que no esté ya convertido
    const clienteExistente = await Cliente.findOne({ where: { lead_id: id } });
    if (clienteExistente) {
      return Response.json({ 
        error: 'Este lead ya fue convertido a cliente',
        clienteId: clienteExistente.id 
      }, { status: 400 });
    }

    // Crear el cliente
    const cliente = await Cliente.create({
      lead_id: id,
      fecha_alta: new Date(),
      estado_cliente: 'activo',
      created_at: new Date(),
    });

    // Actualizar el estado del lead a "convertido"
    const estadoConvertido = await EstadoLead.findOne({ where: { nombre: 'convertido' } });
    if (estadoConvertido) {
      await HistorialEstadoLead.create({
        lead_id: id,
        estado_id: estadoConvertido.id,
        cambiado_por: 'sistema',
        created_at: new Date(),
      });
    }

    return Response.json({ 
      success: true,
      clienteId: cliente.id,
      message: 'Lead convertido a cliente exitosamente' 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error al convertir lead:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
