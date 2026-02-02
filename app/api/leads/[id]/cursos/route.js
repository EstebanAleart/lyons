// app/api/leads/[id]/cursos/route.js
// API para gestionar cursos de interés de un lead

import { Lead, LeadCurso, Curso } from '@/lib/models';
import { v4 as uuidv4 } from 'uuid';

// GET: Obtener cursos de interés del lead
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const leadCursos = await LeadCurso.findAll({
      where: { lead_id: id },
      include: [{
        model: Curso,
        attributes: ['id', 'nombre', 'descripcion', 'activo'],
      }],
      order: [['prioridad', 'ASC']],
    });

    const result = leadCursos.map(lc => ({
      id: lc.id,
      cursoId: lc.curso_id,
      curso: lc.Curso?.nombre || 'Curso desconocido',
      descripcion: lc.Curso?.descripcion,
      prioridad: lc.prioridad,
      activo: lc.Curso?.activo,
    }));

    return Response.json(result);
  } catch (error) {
    console.error('Error al obtener cursos de interés:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// POST: Agregar un curso de interés al lead
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { cursoId, prioridad } = body;

    if (!cursoId) {
      return Response.json({ error: 'cursoId es requerido' }, { status: 400 });
    }

    // Verificar que el lead existe
    const lead = await Lead.findByPk(id);
    if (!lead) {
      return Response.json({ error: 'Lead no encontrado' }, { status: 404 });
    }

    // Verificar que el curso existe
    const curso = await Curso.findByPk(cursoId);
    if (!curso) {
      return Response.json({ error: 'Curso no encontrado' }, { status: 404 });
    }

    // Verificar si ya existe
    const existente = await LeadCurso.findOne({
      where: { lead_id: id, curso_id: cursoId },
    });

    if (existente) {
      return Response.json({ error: 'El lead ya tiene este curso asignado' }, { status: 400 });
    }

    // Obtener la prioridad máxima actual
    const maxPrioridad = await LeadCurso.max('prioridad', { where: { lead_id: id } });
    const nuevaPrioridad = prioridad || (maxPrioridad ? maxPrioridad + 1 : 1);

    // Crear la relación
    const leadCurso = await LeadCurso.create({
      id: uuidv4(),
      lead_id: id,
      curso_id: cursoId,
      prioridad: nuevaPrioridad,
    });

    return Response.json({
      success: true,
      leadCurso: {
        id: leadCurso.id,
        cursoId: leadCurso.curso_id,
        curso: curso.nombre,
        prioridad: leadCurso.prioridad,
      },
    });
  } catch (error) {
    console.error('Error al agregar curso de interés:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Eliminar un curso de interés del lead
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const leadCursoId = searchParams.get('leadCursoId');

    if (!leadCursoId) {
      return Response.json({ error: 'leadCursoId es requerido' }, { status: 400 });
    }

    const leadCurso = await LeadCurso.findOne({
      where: { id: leadCursoId, lead_id: id },
    });

    if (!leadCurso) {
      return Response.json({ error: 'Relación no encontrada' }, { status: 404 });
    }

    await leadCurso.destroy();

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar curso de interés:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
