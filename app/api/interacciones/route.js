// app/api/interacciones/route.js
// API para registrar interacciones (contactos) con leads

import { Interaccion, Canal } from '@/lib/models';
import { v4 as uuidv4 } from 'uuid';

// Mapeo de métodos a canales
const METODO_TO_CANAL = {
  whatsapp: 'WhatsApp',
  email: 'Email',
  llamada: 'Teléfono',
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { leadId, metodo, nota, usuarioId } = body;

    if (!leadId) {
      return Response.json({ error: 'leadId es requerido' }, { status: 400 });
    }

    if (!metodo) {
      return Response.json({ error: 'metodo es requerido' }, { status: 400 });
    }

    // Buscar o crear el canal correspondiente
    const canalNombre = METODO_TO_CANAL[metodo] || metodo;
    let canal = await Canal.findOne({ where: { nombre: canalNombre } });
    
    if (!canal) {
      canal = await Canal.create({
        id: uuidv4(),
        nombre: canalNombre,
      });
    }

    // Crear la interacción
    const now = new Date();
    const interaccion = await Interaccion.create({
      id: uuidv4(),
      lead_id: leadId,
      canal_id: canal.id,
      usuario_id: usuarioId || null,
      resultado: 'contactado',
      nota: nota || null,
      created_at: now,
      updated_at: now,
    });

    return Response.json({
      success: true,
      interaccion: {
        id: interaccion.id,
        leadId: interaccion.lead_id,
        canal: canalNombre,
        nota: interaccion.nota,
        fecha: interaccion.created_at,
      },
    });
  } catch (error) {
    console.error('Error al crear interacción:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// GET: Obtener interacciones de un lead
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');

    if (!leadId) {
      return Response.json({ error: 'leadId es requerido' }, { status: 400 });
    }

    const interacciones = await Interaccion.findAll({
      where: { lead_id: leadId },
      include: [{ model: Canal, attributes: ['nombre'] }],
      order: [['created_at', 'DESC']],
    });

    const result = interacciones.map(i => ({
      id: i.id,
      canal: i.Canal?.nombre || 'Desconocido',
      resultado: i.resultado,
      nota: i.nota,
      fecha: i.created_at,
    }));

    return Response.json(result);
  } catch (error) {
    console.error('Error al obtener interacciones:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
