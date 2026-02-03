// app/api/cursos/route.js
// API Route para obtener cursos desde la DB
import { Curso, LeadCurso } from '@/lib/models';
import { sequelize } from '@/lib/models';

export async function GET(request) {
  try {
    // Cursos con cantidad de leads interesados
    const cursos = await Curso.findAll({
      attributes: [
        'id', 'nombre', 'activo',
        [sequelize.fn('COUNT', sequelize.col('LeadCursos.id')), 'cantidad']
      ],
      include: [{ model: LeadCurso, attributes: [] }],
      group: ['Curso.id'],
      order: [[sequelize.literal('cantidad'), 'DESC']]
    });
    return Response.json(cursos);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { nombre, descripcion = null } = await request.json();
    
    if (!nombre?.trim()) {
      return Response.json({ error: 'El nombre es requerido' }, { status: 400 });
    }

    // Verificar si ya existe
    const existente = await Curso.findOne({
      where: { nombre: nombre.trim() }
    });
    
    if (existente) {
      return Response.json({ error: 'Ya existe un curso con ese nombre' }, { status: 409 });
    }

    const nuevoCurso = await Curso.create({
      nombre: nombre.trim(),
      descripcion,
      activo: true
    });

    return Response.json({
      id: nuevoCurso.id,
      nombre: nuevoCurso.nombre,
      descripcion: nuevoCurso.descripcion,
      activo: nuevoCurso.activo,
    });
    
  } catch (error) {
    console.error('Error creando curso:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
