'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { performanceAsesores } from '@/lib/mock-data'
import { User } from 'lucide-react'

export function AdvisorPerformance() {
  const maxConversiones = Math.max(...performanceAsesores.map((a) => a.conversiones))

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-foreground">
          Performance por Asesor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {performanceAsesores.map((asesor) => (
            <div key={asesor.asesor} className="space-y-2">
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
                    {asesor.tasa}% tasa
                  </p>
                </div>
              </div>
              <Progress
                value={(asesor.conversiones / maxConversiones) * 100}
                className="h-2"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
