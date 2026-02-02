'use client'

import { useState, useEffect } from 'react'
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

// Colores corporativos
const COLORS = {
  nuevos: '#0f2d4c',
  reactivados: '#f7a90c',
  convertidos: '#24c65d',
}

export function ActivityChart() {
  const [leadsPorDia, setLeadsPorDia] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/actividad')
      .then(res => res.json())
      .then(data => {
        setLeadsPorDia(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Card className="border-border/50 bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-foreground">
            Actividad de Leads (14 días)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="text-sm text-muted-foreground">Cargando actividad...</span>
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
          Actividad de Leads (14 días)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            nuevos: {
              label: 'Nuevos',
              color: COLORS.nuevos,
            },
            reactivados: {
              label: 'Reactivados',
              color: COLORS.reactivados,
            },
            convertidos: {
              label: 'Convertidos',
              color: COLORS.convertidos,
            },
          }}
          className="h-[280px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={leadsPorDia}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorNuevos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.nuevos} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.nuevos} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorReactivados" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.reactivados} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.reactivados} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorConvertidos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.convertidos} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.convertidos} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="fecha"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#71717a', fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#71717a', fontSize: 11 }}
                width={35}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                cursor={{ stroke: '#3f3f46', strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="nuevos"
                stroke={COLORS.nuevos}
                strokeWidth={2}
                fill="url(#colorNuevos)"
                name="Nuevos"
              />
              <Area
                type="monotone"
                dataKey="reactivados"
                stroke={COLORS.reactivados}
                strokeWidth={2}
                fill="url(#colorReactivados)"
                name="Reactivados"
              />
              <Area
                type="monotone"
                dataKey="convertidos"
                stroke={COLORS.convertidos}
                strokeWidth={2}
                fill="url(#colorConvertidos)"
                name="Convertidos"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 flex justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS.nuevos }} />
            <span className="text-xs text-muted-foreground">Nuevos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS.reactivados }} />
            <span className="text-xs text-muted-foreground">Reactivados</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS.convertidos }} />
            <span className="text-xs text-muted-foreground">Convertidos</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
