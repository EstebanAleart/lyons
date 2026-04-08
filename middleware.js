import { auth } from "./auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Rutas públicas
  if (pathname === "/" || pathname === "/no-autorizado" || pathname.startsWith("/api")) {
    return NextResponse.next()
  }

  // Requiere sesión para todo lo demás
  if (!session) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  // /system solo para admin
  if (pathname.startsWith("/system")) {
    if (session.user?.rol !== "admin") {
      return NextResponse.redirect(new URL("/no-autorizado", req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images).*)"],
}