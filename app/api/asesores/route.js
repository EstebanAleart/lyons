import { sequelize, Lead, Interaccion, Usuario, EstadoLead } from '@/lib/models'
import { Op } from 'sequelize'

export async function GET() {
  try {
    // Obtener todos los usuarios (asesores)
    const usuarios = await Usuario.findAll({
      attributes: ['id', 'nombre'],
      raw: true
    })

    // Obtener estado convertido
    const estadoConvertido = await EstadoLead.findOne({ 
      where: { nombre: 'convertido' },
      raw: true 
    })

    // Para cada usuario, calcular métricas
    const performance = await Promise.all(usuarios.map(async (usuario) => {
      // Contar contactos (interacciones) del usuario
      const contactos = await Interaccion.count({
        where: { usuario_id: usuario.id }
      })

      // Contar leads asignados
      const leadsAsignados = await Lead.count({
        where: { usuario_id: usuario.id }
      })

      // Contar conversiones (leads con estado convertido asignados al usuario)
      let conversiones = 0
      if (estadoConvertido) {
        conversiones = await Lead.count({
          where: { 
            usuario_id: usuario.id,
            estadoActualId: estadoConvertido.id
          }
        })
      }

      // Calcular tasa de conversión
      const tasa = leadsAsignados > 0 
        ? Math.round((conversiones / leadsAsignados) * 100) 
        : 0

      return {
        id: usuario.id,
        asesor: usuario.nombre,
        contactos,
        conversiones,
        tasaConversion: tasa,
        leadsAsignados
      }
    }))

    // Filtrar usuarios sin actividad y ordenar por conversiones
    const performanceFiltrado = performance
      .filter(p => p.contactos > 0 || p.leadsAsignados > 0)
      .sort((a, b) => b.conversiones - a.conversiones)

    return Response.json(performanceFiltrado)
  } catch (error) {
    console.error('Error en /api/asesores:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
