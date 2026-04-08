import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('rol, activo')
      .eq('email', session.user.email)
      .single()

    if (error && error.code === 'PGRST116') {
      await supabase.from('usuarios').insert({
        nombre: session.user.name,
        email: session.user.email,
        rol: 'usuario',
        activo: false
      })
      return NextResponse.json({ rol: 'usuario', activo: false, created: true })
    }

    if (error) throw error

    return NextResponse.json({ rol: data.rol, activo: data.activo, created: false })
  } catch (error) {
    console.error("Error en sync-user:", error)
    return NextResponse.json({ error: "Error de DB" }, { status: 500 })
  }
}
