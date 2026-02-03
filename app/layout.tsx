import React, { Suspense } from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { StoreProvider } from '@/components/providers/store-provider'
import { Toaster } from '@/components/ui/sonner'
import Tracker from '@/components/analytics/tracker'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'LeadFlow - Dashboard de Gestión de Leads',
  description: 'Sistema de gestión y reactivación de leads con análisis de métricas y visualización de datos',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`font-sans antialiased`}>
        <StoreProvider>
          {children}
        </StoreProvider>
        <Toaster richColors position="top-center" />
        <Suspense fallback={null}>
          <Tracker />
        </Suspense>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
