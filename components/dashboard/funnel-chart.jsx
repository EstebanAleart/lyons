'use client'

import { useState, useEffect } from 'react'
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer } from '@/components/ui/chart'

// Colores corporativos para el funnel
const COLORS = ['#0f2d4c', '#1a4a7a', '#f7a90c', '#d4920a', '#24c65d', '#6b7280']

export function FunnelChart() {
  const [funnelData, setFunnelData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/funnel')
      .then(res => res.json())
      .then(data => {
        const dataWithColors = data.map((item, index) => ({
          ...item,
          color: COLORS[index % COLORS.length]
        }))
        setFunnelData(dataWithColors)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="text-muted-foreground p-4">Cargando funnel...</div>
  }

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-foreground">
          Funnel de Conversión
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            cantidad: {
              label: 'Cantidad',
              color: '#0f2d4c',
            },
          }}
          className="h-[280px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={funnelData}
              layout="vertical"
              margin={{ top: 5, right: 60, left: 20, bottom: 5 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="estado"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#a1a1aa', fontSize: 12 }}
                width={90}
              />
              <Bar
                dataKey="cantidad"
                radius={[0, 4, 4, 0]}
                maxBarSize={32}
              >
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <LabelList
                  dataKey="cantidad"
                  position="right"
                  fill="#ffffff"
                  fontSize={12}
                  formatter={(value) => value.toLocaleString()}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 flex flex-wrap gap-3">
          {funnelData.map((stage) => (
            <div key={stage.estado} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: stage.color }}
              />
              <span className="text-xs text-muted-foreground">
                {stage.estado}: {stage.porcentaje}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
