'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, PhoneCall, TrendingUp, AlertTriangle } from 'lucide-react'

const icons = {
  'Total Leads': Users,
  'Tasa de Contacto': PhoneCall,
  'Tasa de Conversión': TrendingUp,
  'Leads Vencidos': AlertTriangle,
}

export function KpiCards() {
  const [kpis, setKpis] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/kpis')
      .then(res => res.json())
      .then(data => {
        setKpis([
          { label: 'Total Leads', value: data.totalLeads },
          { label: 'Tasa de Contacto', value: data.tasaContacto },
          { label: 'Tasa de Conversión', value: data.tasaConversion },
          { label: 'Leads Vencidos', value: data.leadsVencidos },
        ])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading || !kpis) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-border/50 bg-card">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((metric) => {
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
