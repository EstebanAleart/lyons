// app/api/kpis/route.js
// API Route para obtener KPIs principales desde la DB
import { Lead, Cliente, Interaccion, HistorialEstadoLead } from '@/lib/models';
import { sequelize } from '@/lib/models';
import { Op } from 'sequelize';

export async function GET(request) {
  try {
    const now = new Date();
    const hace30Dias = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Total leads
    const totalLeads = await Lead.count();

    // Leads tocados (con al menos una interacción)
    const leadsTocados = await Interaccion.count({ distinct: true, col: 'lead_id' });

    // Leads convertidos (clientes)
    const totalClientes = await Cliente.count();

    // Leads vencidos (sin interacción en 30 días)
    const leadsConInteraccionReciente = await Interaccion.findAll({
      attributes: ['lead_id'],
      where: { updated_at: { [Op.gte]: hace30Dias } },
      group: ['lead_id']
    });
    const idsRecientes = leadsConInteraccionReciente.map(i => i.lead_id);
    const leadsVencidos = await Lead.count({
      where: idsRecientes.length ? { id: { [Op.notIn]: idsRecientes } } : {}
    });

    // Tasa de contacto y conversión
    const tasaContacto = totalLeads > 0 ? ((leadsTocados / totalLeads) * 100).toFixed(1) : 0;
    const tasaConversion = totalLeads > 0 ? ((totalClientes / totalLeads) * 100).toFixed(1) : 0;

    return Response.json({
      totalLeads,
      tasaContacto: `${tasaContacto}%`,
      tasaConversion: `${tasaConversion}%`,
      leadsVencidos
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
