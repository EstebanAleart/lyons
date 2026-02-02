'use client'

import { Card, CardContent } from '@/components/ui/card'
import { kpiMetrics } from '@/lib/mock-data'
import { Users, PhoneCall, TrendingUp, AlertTriangle } from 'lucide-react'

const icons = {
  'Total Leads': Users,
  'Tasa de Contacto': PhoneCall,
  'Tasa de Conversión': TrendingUp,
  'Leads Vencidos': AlertTriangle,
}

export function KpiCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpiMetrics.map((metric) => {
        const Icon = icons[metric.label] || Users
        const isPositive = metric.change && metric.change > 0
        const isNegative = metric.change && metric.change < 0

        return (
          <Card key={metric.label} className="border-border/50 bg-card">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="text-3xl font-semibold tracking-tight text-foreground">
                    {metric.value}
                  </p>
                  {metric.change !== undefined && (
                    <div className="flex items-center gap-1">
                      <span
                        className={`text-sm font-medium ${
                          metric.label === 'Leads Vencidos'
                            ? isNegative
                              ? 'text-[#24c65d]'
                              : 'text-[#dc5a5a]'
                            : isPositive
                              ? 'text-[#24c65d]'
                              : 'text-[#dc5a5a]'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {metric.change}%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {metric.changeLabel}
                      </span>
                    </div>
                  )}
                </div>
                <div className="rounded-lg bg-[#0f2d4c]/10 p-3">
                  <Icon className="h-5 w-5 text-[#0f2d4c]" />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
