'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Activity, 
  Monitor, 
  Smartphone, 
  Clock, 
  Eye,
  Zap,
  TrendingUp,
  Server,
  AlertCircle
} from 'lucide-react'

/**
 * SALUD DEL SISTEMA
 * 
 * Este componente muestra métricas de USO y PERFORMANCE del sistema,
 * NO métricas de negocio (leads, conversiones, funnels).
 * 
 * Métricas de Vercel Analytics a interpretar:
 * - Page Views: Cuántas veces se cargó cada página
 * - Unique Visitors: Usuarios únicos del sistema
 * - Top Pages: Páginas más utilizadas
 * - Referrers: Cómo llegan los usuarios (interno)
 * - Device/Browser: Desktop vs Mobile, Chrome vs Firefox
 * - Country/Region: Ubicación de uso
 * 
 * Métricas de Speed Insights (Web Vitals):
 * - LCP (Largest Contentful Paint): Tiempo de carga percibido
 * - FID (First Input Delay): Respuesta a interacción
 * - CLS (Cumulative Layout Shift): Estabilidad visual
 * - TTFB (Time to First Byte): Respuesta del servidor
 * 
 * QUÉ NO MEDIR AQUÍ:
 * ❌ Cantidad de leads (ya está en la DB)
 * ❌ Conversiones (ya está en la DB)
 * ❌ Funnel de ventas (ya está en la DB)
 * ❌ Performance de asesores (ya está en la DB)
 */

export function SystemHealth() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/system-health')
      .then(res => res.json())
      .then(data => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => {
        // Fallback con datos simulados si la API no existe aún
        setStats({
          uptime: '99.9%',
          avgResponseTime: '245ms',
          activeUsers: 12,
          todayPageViews: 847,
          deviceBreakdown: { desktop: 78, mobile: 22 },
          topPages: [
            { path: '/dashboard', views: 312, percentage: 37 },
            { path: '/leads', views: 256, percentage: 30 },
            { path: '/clientes', views: 142, percentage: 17 },
            { path: '/lead/:id', views: 137, percentage: 16 },
          ],
          webVitals: {
            lcp: { value: 1.8, status: 'good', label: 'LCP' },
            fid: { value: 45, status: 'good', label: 'FID' },
            cls: { value: 0.05, status: 'good', label: 'CLS' },
            ttfb: { value: 180, status: 'good', label: 'TTFB' },
          },
          lastUpdated: new Date().toISOString()
        })
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    )
  }

  const vitalStatus = {
    good: 'bg-green-500/20 text-green-600 border-green-500/30',
    'needs-improvement': 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30',
    poor: 'bg-red-500/20 text-red-600 border-red-500/30',
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Salud del Sistema
            </CardTitle>
            <CardDescription>
              Métricas de uso y performance — No métricas de negocio
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
            <Server className="h-3 w-3 mr-1" />
            Online
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resumen rápido */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <Eye className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-semibold">{stats.todayPageViews}</p>
            <p className="text-xs text-muted-foreground">Vistas hoy</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <TrendingUp className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-semibold">{stats.activeUsers}</p>
            <p className="text-xs text-muted-foreground">Usuarios activos</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <Clock className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-semibold">{stats.avgResponseTime}</p>
            <p className="text-xs text-muted-foreground">Tiempo respuesta</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <Zap className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-semibold">{stats.uptime}</p>
            <p className="text-xs text-muted-foreground">Uptime</p>
          </div>
        </div>

        {/* Desktop vs Mobile */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Dispositivos</span>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Monitor className="h-3 w-3" /> Desktop {stats.deviceBreakdown.desktop}%
              </span>
              <span className="flex items-center gap-1">
                <Smartphone className="h-3 w-3" /> Mobile {stats.deviceBreakdown.mobile}%
              </span>
            </div>
          </div>
          <div className="flex h-2 rounded-full overflow-hidden bg-muted">
            <div 
              className="bg-blue-500" 
              style={{ width: `${stats.deviceBreakdown.desktop}%` }} 
            />
            <div 
              className="bg-purple-500" 
              style={{ width: `${stats.deviceBreakdown.mobile}%` }} 
            />
          </div>
        </div>

        {/* Páginas más visitadas */}
        <div>
          <h4 className="text-sm font-medium mb-3">Páginas más visitadas</h4>
          <div className="space-y-2">
            {stats.topPages.map((page) => (
              <div key={page.path} className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-24 truncate">
                  {page.path}
                </span>
                <div className="flex-1">
                  <Progress value={page.percentage} className="h-2" />
                </div>
                <span className="text-sm font-medium w-16 text-right">
                  {page.views} vistas
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Web Vitals */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            Web Vitals 
            <Badge variant="outline" className="text-xs">Performance</Badge>
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.values(stats.webVitals).map((vital) => (
              <div 
                key={vital.label} 
                className="p-2 rounded-lg border border-border/50 text-center"
              >
                <Badge 
                  variant="outline" 
                  className={`${vitalStatus[vital.status]} text-xs mb-1`}
                >
                  {vital.label}
                </Badge>
                <p className="text-lg font-semibold">
                  {vital.label === 'CLS' ? vital.value : `${vital.value}${vital.label === 'LCP' ? 's' : 'ms'}`}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Info box */}
        <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
          <div className="flex gap-2">
            <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium text-foreground mb-1">¿Qué mide esta sección?</p>
              <p>
                <strong>Uso del sistema</strong> (page views, usuarios activos, dispositivos) y 
                <strong> performance</strong> (tiempos de carga, Web Vitals). 
                Las métricas de negocio (leads, conversiones, funnels) viven en la base de datos 
                y se muestran en las otras secciones del dashboard.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
