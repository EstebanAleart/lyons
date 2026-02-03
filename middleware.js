import { auth } from "./auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth
  
  // Rutas públicas
  if (pathname === "/" || pathname === "/no-autorizado" || pathname.startsWith("/api")) {
    return NextResponse.next()
  }
  
  // Proteger dashboard - requiere autenticación
  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      return NextResponse.redirect(new URL("/", req.url))
    }
    // El chequeo de rol se hace en el dashboard mismo
  }
  
  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images).*)"],
}