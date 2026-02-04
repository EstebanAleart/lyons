import { Pool } from "pg"
import { auth } from "@/auth"
import { NextResponse } from "next/server"

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: parseInt(process.env.DB_PORT || '5432'),
})

export async function GET() {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  try {
    // Verificar si existe
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [session.user.email]
    )
    
    if (result.rows.length === 0) {
      // Crear usuario nuevo
      await pool.query(
        'INSERT INTO usuarios (nombre, email, rol, activo) VALUES ($1, $2, $3, $4)',
        [session.user.name, session.user.email, 'usuario', false]
      )
      
      return NextResponse.json({
        rol: 'usuario',
        activo: false,
        created: true
      })
    }
    
    // Devolver datos del usuario
    return NextResponse.json({
      rol: result.rows[0].rol,
      activo: result.rows[0].activo,
      created: false
    })
    
  } catch (error) {
    console.error("Error en sync-user:", error)
    return NextResponse.json({ error: "Error de DB" }, { status: 500 })
  }
}