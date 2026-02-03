'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { User } from 'lucide-react'

export function AdvisorPerformance() {
  const [performanceAsesores, setPerformanceAsesores] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/asesores')
      .then(res => res.json())
      .then(data => {
        setPerformanceAsesores(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const maxConversiones = performanceAsesores.length > 0 
    ? Math.max(...performanceAsesores.map((a) => a.conversiones), 1)
    : 1

  if (loading) {
    return (
      <Card className="border-border/50 bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-foreground">
            Performance por Asesor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="text-sm text-muted-foreground">Cargando asesores...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-foreground">
          Performance por Asesor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {performanceAsesores.length === 0 ? (
            <p className="text-muted-foreground text-sm">No hay datos de asesores</p>
          ) : (
            performanceAsesores.map((asesor) => (
              <div key={asesor.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0f2d4c]/10">
                      <User className="h-4 w-4 text-[#0f2d4c]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {asesor.asesor}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {asesor.contactos} contactos
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {asesor.conversiones}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {asesor.tasaConversion}% tasa
                    </p>
                  </div>
                </div>
                <Progress
                  value={(asesor.conversiones / maxConversiones) * 100}
                  className="h-2"
                />
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
