import { Cliente, Lead, Genero, Localidad } from '@/lib/models'

export async function GET() {
  try {
    const clientes = await Cliente.findAll({
      include: [
        {
          model: Lead,
          include: [
            { model: Genero, attributes: ['descripcion'] },
            { model: Localidad, attributes: ['nombre'] }
          ]
        }
      ],
      order: [['fecha_alta', 'DESC']]
    })

    // Formatear datos para el frontend
    const clientesFormateados = clientes.map(c => {
      const cliente = c.toJSON()
      return {
        id: cliente.id,
        leadId: cliente.lead_id,
        nombre: cliente.Lead?.nombre || '',
        apellido: cliente.Lead?.apellido || '',
        email: cliente.Lead?.email || '',
        telefono: cliente.Lead?.telefono || '',
        genero: cliente.Lead?.Genero?.descripcion || '',
        localidad: cliente.Lead?.Localidad?.nombre || '',
        fechaAlta: cliente.fecha_alta,
        estadoCliente: cliente.estado_cliente || 'activo'
      }
    })

    return Response.json(clientesFormateados)
  } catch (error) {
    console.error('Error en /api/clientes:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
