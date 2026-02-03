// app/api/usuarios/route.js
// API para obtener usuarios/asesores

import { Usuario } from '@/lib/models';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const soloActivos = searchParams.get('activos') !== 'false';

    const where = soloActivos ? { activo: true } : {};

    const usuarios = await Usuario.findAll({
      where,
      attributes: ['id', 'nombre', 'email', 'rol', 'activo'],
      order: [['nombre', 'ASC']],
    });

    return Response.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
