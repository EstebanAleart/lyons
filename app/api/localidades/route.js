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

export async function POST(request) {
  try {
    const { nombre, region = null, pais = 'Uruguay' } = await request.json();
    
    if (!nombre?.trim()) {
      return Response.json({ error: 'El nombre es requerido' }, { status: 400 });
    }

    // Verificar si ya existe
    const existente = await Localidad.findOne({
      where: { nombre: nombre.trim() }
    });
    
    if (existente) {
      return Response.json({ error: 'Ya existe una localidad con ese nombre' }, { status: 409 });
    }

    const nuevaLocalidad = await Localidad.create({
      nombre: nombre.trim(),
      region,
      pais
    });

    return Response.json({
      id: nuevaLocalidad.id,
      nombre: nuevaLocalidad.nombre,
      region: nuevaLocalidad.region,
      pais: nuevaLocalidad.pais,
    });
    
  } catch (error) {
    console.error('Error creando localidad:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
