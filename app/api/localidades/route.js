// app/api/localidades/route.js
import { Localidad } from '@/lib/models';

export async function GET() {
  try {
    const localidades = await Localidad.findAll({
      order: [['nombre', 'ASC']],
    });
    
    return Response.json(localidades.map(l => ({
      id: l.id,
      nombre: l.nombre,
      region: l.region,
      pais: l.pais,
    })));
  } catch (error) {
    console.error('Error en /api/localidades:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
