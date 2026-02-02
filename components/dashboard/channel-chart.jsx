'use client'

import { useState, useEffect } from 'react'
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

// Colores corporativos
const COLORS = {
  total: '#0f2d4c',
  contactados: '#f7a90c',
  convertidos: '#24c65d',
}

export function ChannelChart() {
  const [canalMetrics, setCanalMetrics] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/canales')
      .then(res => res.json())
      .then(data => {
        setCanalMetrics(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="text-muted-foreground p-4">Cargando canales...</div>
  }

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-foreground">
          Rendimiento por Canal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            total: {
              label: 'Total',
              color: COLORS.total,
            },
            contactados: {
              label: 'Contactados',
              color: COLORS.contactados,
            },
            convertidos: {
              label: 'Convertidos',
              color: COLORS.convertidos,
            },
          }}
          className="h-[280px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={canalMetrics}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <XAxis
                dataKey="canal"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#71717a', fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#71717a', fontSize: 11 }}
                width={35}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                cursor={{ fill: '#27272a', opacity: 0.3 }}
              />
              <Bar
                dataKey="total"
                fill={COLORS.total}
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
                name="Total"
              />
              <Bar
                dataKey="contactados"
                fill={COLORS.contactados}
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
                name="Contactados"
              />
              <Bar
                dataKey="convertidos"
                fill={COLORS.convertidos}
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
                name="Convertidos"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {canalMetrics.map((canal) => (
            <div key={canal.canal} className="rounded-lg bg-secondary/50 p-3">
              <p className="text-xs text-muted-foreground">{canal.canal}</p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {canal.tasaConversion}%
              </p>
              <p className="text-xs text-muted-foreground">conversión</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
