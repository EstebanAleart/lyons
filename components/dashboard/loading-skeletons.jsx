'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function KpiCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

export function ChartSkeleton({ title = "Cargando..." }) {
  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent>
        <div className="h-[280px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="text-sm text-muted-foreground">{title}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function TableSkeleton() {
  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <KpiCardsSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton title="Cargando funnel..." />
        <ChartSkeleton title="Cargando actividad..." />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartSkeleton title="Cargando canales..." />
        <ChartSkeleton title="Cargando cursos..." />
        <ChartSkeleton title="Cargando asesores..." />
      </div>
      <TableSkeleton />
    </div>
  )
}
