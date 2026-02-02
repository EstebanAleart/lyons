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
