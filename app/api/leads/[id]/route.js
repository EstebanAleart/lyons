// app/api/leads/[id]/route.js
// API para obtener detalle completo de un lead

import { Lead, Genero, Localidad, Origen, Cliente, Interaccion, Canal, Usuario, HistorialEstadoLead, EstadoLead, LeadCurso, Curso } from '@/lib/models';

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const lead = await Lead.findByPk(id, {
      include: [
        { model: Genero, attributes: ['codigo', 'descripcion'] },
        { model: Localidad, attributes: ['nombre', 'region', 'pais'] },
        { model: Origen, attributes: ['nombre'] },
        { model: Cliente, attributes: ['id', 'fecha_alta', 'estado_cliente', 'created_at'] },
      ],
    });

    if (!lead) {
      return Response.json({ error: 'Lead no encontrado' }, { status: 404 });
    }

    // Obtener interacciones con canal y usuario
    const interacciones = await Interaccion.findAll({
      where: { lead_id: id },
      include: [
        { model: Canal, attributes: ['nombre'] },
        { model: Usuario, attributes: ['nombre', 'email'] },
      ],
      order: [['created_at', 'DESC']],
    });

    // Obtener historial de estados
    const historialEstados = await HistorialEstadoLead.findAll({
      where: { lead_id: id },
      include: [
        { model: EstadoLead, attributes: ['nombre'] },
      ],
      order: [['created_at', 'DESC']],
    });

    // Obtener cursos de interés
    const cursosInteres = await LeadCurso.findAll({
      where: { lead_id: id },
      include: [
        { model: Curso, attributes: ['nombre', 'activo'] },
      ],
      order: [['prioridad', 'ASC']],
    });

    const result = {
      id: lead.id,
      nombre: lead.nombre,
      apellido: lead.apellido,
      telefono: lead.telefono,
      email: lead.email,
      genero: lead.Genero?.descripcion || lead.Genero?.codigo || null,
      localidad: lead.Localidad ? {
        nombre: lead.Localidad.nombre,
        region: lead.Localidad.region,
        pais: lead.Localidad.pais,
      } : null,
      origen: lead.Origen?.nombre || null,
      createdAt: lead.created_at,
      updatedAt: lead.updated_at,
      
      // Cliente (si se convirtió)
      cliente: lead.Cliente ? {
        id: lead.Cliente.id,
        fechaAlta: lead.Cliente.fecha_alta,
        estado: lead.Cliente.estado_cliente,
      } : null,
      
      // Interacciones
      interacciones: interacciones.map(i => ({
        id: i.id,
        canal: i.Canal?.nombre || 'Desconocido',
        resultado: i.resultado,
        nota: i.nota,
        fecha: i.created_at,
        usuario: i.Usuario ? {
          nombre: i.Usuario.nombre,
          email: i.Usuario.email,
        } : null,
      })),
      
      // Historial de estados
      historialEstados: historialEstados.map(h => ({
        id: h.id,
        estado: h.EstadoLead?.nombre || 'Desconocido',
        cambiadoPor: h.cambiado_por,
        fecha: h.created_at,
      })),
      
      // Cursos de interés
      cursosInteres: cursosInteres.map(c => ({
        id: c.id,
        curso: c.Curso?.nombre || 'Desconocido',
        activo: c.Curso?.activo,
        prioridad: c.prioridad,
      })),
      
      // Estadísticas rápidas
      stats: {
        totalInteracciones: interacciones.length,
        ultimaInteraccion: interacciones[0]?.created_at || null,
        estadoActual: historialEstados[0]?.EstadoLead?.nombre || 'nuevo',
        esCliente: !!lead.Cliente,
      },
    };

    return Response.json(result);
  } catch (error) {
    console.error('Error al obtener lead:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
