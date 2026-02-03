// app/api/origenes/route.js
import { Origen } from '@/lib/models';

export async function GET() {
  try {
    const origenes = await Origen.findAll({
      order: [['nombre', 'ASC']],
    });
    
    return Response.json(origenes.map(o => ({
      id: o.id,
      nombre: o.nombre,
    })));
  } catch (error) {
    console.error('Error en /api/origenes:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
