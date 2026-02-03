import { sequelize, Lead, HistorialEstadoLead, EstadoLead } from '@/lib/models'
import { Op } from 'sequelize'

export async function GET() {
  try {
    // Últimos 14 días
    const fechaInicio = new Date()
    fechaInicio.setDate(fechaInicio.getDate() - 14)

    // Obtener leads creados en los últimos 14 días agrupados por día
    const leadsPorDia = await Lead.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at')), 'fecha'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'total']
      ],
      where: {
        created_at: {
          [Op.gte]: fechaInicio
        }
      },
      group: [sequelize.fn('DATE', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
      raw: true
    })

    // Obtener leads convertidos (por historial de cambio a estado "convertido")
    const estadoConvertido = await EstadoLead.findOne({ where: { nombre: 'convertido' } })
    
    let conversionesPorDia = []
    if (estadoConvertido) {
      conversionesPorDia = await HistorialEstadoLead.findAll({
        attributes: [
          [sequelize.fn('DATE', sequelize.col('created_at')), 'fecha'],
          [sequelize.fn('COUNT', sequelize.col('HistorialEstadoLead.id')), 'total']
        ],
        where: {
          estado_id: estadoConvertido.id,
          created_at: {
            [Op.gte]: fechaInicio
          }
        },
        group: [sequelize.fn('DATE', sequelize.col('created_at'))],
        order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
        raw: true
      })
    }

    // Crear array de los últimos 14 días
    const actividad = []
    for (let i = 13; i >= 0; i--) {
      const fecha = new Date()
      fecha.setDate(fecha.getDate() - i)
      const fechaStr = fecha.toISOString().split('T')[0]
      const dia = fecha.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric' })

      const nuevosData = leadsPorDia.find(l => l.fecha === fechaStr)
      const convertidosData = conversionesPorDia.find(c => c.fecha === fechaStr)

      actividad.push({
        dia,
        fecha: fechaStr,
        nuevos: parseInt(nuevosData?.total || 0),
        reactivados: 0, // TODO: Implementar lógica de reactivación
        convertidos: parseInt(convertidosData?.total || 0)
      })
    }

    return Response.json(actividad)
  } catch (error) {
    console.error('Error en /api/actividad:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
