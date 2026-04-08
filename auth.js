import NextAuth from "next-auth"
import Auth0Provider from "next-auth/providers/auth0"
import { supabase } from "@/lib/supabase"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      issuer: process.env.AUTH0_ISSUER,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        token.email = user.email
        token.name = user.name
        // Buscar rol en Supabase al hacer login
        const { data } = await supabase
          .from('usuarios')
          .select('rol, activo')
          .eq('email', user.email)
          .single()
        token.rol = data?.rol ?? 'usuario'
        token.activo = data?.activo ?? false
      }
      return token
    },
    async session({ session, token }) {
      session.user.email = token.email
      session.user.name = token.name
      session.user.rol = token.rol
      session.user.activo = token.activo
      return session
    },
  },
})