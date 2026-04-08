'use client'

import { useSession } from 'next-auth/react'

export function useRole() {
  const { data: session } = useSession()
  const rol = session?.user?.rol ?? 'usuario'
  return {
    rol,
    isAdmin: rol === 'admin',
    isAsesor: rol === 'asesor',
  }
}
