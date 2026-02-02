'use client'

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { leadsPorCurso } from '@/lib/mock-data'

// Colores corporativos
const colors = ['#0f2d4c', '#1a4a7a', '#f7a90c', '#24c65d', '#dc5a5a']

export function CourseChart() {
  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-foreground">
          Leads por Curso
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <ChartContainer
            config={{
              cantidad: {
                label: 'Cantidad',
                color: '#0f2d4c',
              },
            }}
            className="h-[200px] w-full lg:w-1/2"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leadsPorCurso}
                  dataKey="cantidad"
                  nameKey="curso"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {leadsPorCurso.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={<ChartTooltipContent nameKey="curso" />}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="flex flex-col gap-2 lg:w-1/2">
            {leadsPorCurso.map((curso, index) => (
              <div
                key={curso.curso}
                className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="text-sm text-foreground">{curso.curso}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-foreground">
                    {curso.cantidad}
                  </span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({curso.porcentaje}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
