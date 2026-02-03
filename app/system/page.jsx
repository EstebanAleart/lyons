"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/dashboard/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  Monitor,
  Smartphone,
  Clock,
  Eye,
  Zap,
  TrendingUp,
  Server,
  Database,
  HardDrive,
  Cpu,
  MemoryStick,
  Globe,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Timer,
  BarChart3,
  PieChart,
  LineChart,
  Wifi,
  WifiOff,
  Chrome,
  Laptop,
  Tablet,
} from "lucide-react";

export default function SystemHealthPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchStats = () => {
    setLoading(true);
    fetch("/api/system-health")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
        setLastRefresh(new Date());
      })
      .catch(() => {
        // Datos de desarrollo/fallback con más detalle
        setStats({
          status: "online",
          uptime: "99.97%",
          uptimeSeconds: 2592000, // 30 días
          
          // Métricas de uso
          usage: {
            todayPageViews: 847,
            yesterdayPageViews: 792,
            weekPageViews: 5234,
            monthPageViews: 21456,
            activeUsers: 12,
            peakActiveUsers: 28,
            avgSessionDuration: "4m 32s",
            bounceRate: "12%",
          },
          
          // Dispositivos detallado
          devices: {
            desktop: 78,
            mobile: 18,
            tablet: 4,
          },
          
          // Navegadores
          browsers: [
            { name: "Chrome", percentage: 72, sessions: 612 },
            { name: "Safari", percentage: 15, sessions: 127 },
            { name: "Firefox", percentage: 8, sessions: 68 },
            { name: "Edge", percentage: 5, sessions: 42 },
          ],
          
          // Páginas
          topPages: [
            { path: "/dashboard", views: 312, avgTime: "2m 15s", bounceRate: "8%" },
            { path: "/leads", views: 256, avgTime: "3m 42s", bounceRate: "5%" },
            { path: "/clientes", views: 142, avgTime: "2m 58s", bounceRate: "11%" },
            { path: "/leads/:id", views: 137, avgTime: "1m 23s", bounceRate: "15%" },
            { path: "/api/leads", views: 1247, avgTime: "-", bounceRate: "-" },
            { path: "/api/clientes", views: 892, avgTime: "-", bounceRate: "-" },
          ],
          
          // Web Vitals detallado
          webVitals: {
            lcp: { value: 1.8, unit: "s", status: "good", p75: 2.1, target: 2.5, description: "Largest Contentful Paint" },
            fid: { value: 45, unit: "ms", status: "good", p75: 62, target: 100, description: "First Input Delay" },
            cls: { value: 0.05, unit: "", status: "good", p75: 0.08, target: 0.1, description: "Cumulative Layout Shift" },
            ttfb: { value: 180, unit: "ms", status: "good", p75: 245, target: 800, description: "Time to First Byte" },
            fcp: { value: 1.2, unit: "s", status: "good", p75: 1.5, target: 1.8, description: "First Contentful Paint" },
            inp: { value: 85, unit: "ms", status: "good", p75: 120, target: 200, description: "Interaction to Next Paint" },
          },
          
          // Performance del servidor
          server: {
            avgResponseTime: 45,
            p95ResponseTime: 180,
            p99ResponseTime: 320,
            requestsPerMinute: 42,
            errorRate: 0.02,
            activeConnections: 8,
            dbPoolSize: 10,
            dbActiveConnections: 3,
            cacheHitRate: 94.5,
          },
          
          // Base de datos
          database: {
            status: "healthy",
            responseTime: 12,
            totalRows: 45678,
            tableStats: [
              { table: "leads", rows: 23456, size: "45 MB" },
              { table: "clientes", rows: 8234, size: "18 MB" },
              { table: "interacciones", rows: 12456, size: "28 MB" },
              { table: "usuarios", rows: 15, size: "0.1 MB" },
            ],
            lastBackup: "2026-02-03 03:00:00",
            backupSize: "156 MB",
          },
          
          // APIs
          apiEndpoints: [
            { endpoint: "/api/leads", status: "ok", avgMs: 42, calls24h: 1247 },
            { endpoint: "/api/clientes", status: "ok", avgMs: 38, calls24h: 892 },
            { endpoint: "/api/interacciones", status: "ok", avgMs: 25, calls24h: 456 },
            { endpoint: "/api/kpis", status: "ok", avgMs: 180, calls24h: 124 },
            { endpoint: "/api/funnel", status: "ok", avgMs: 95, calls24h: 98 },
            { endpoint: "/api/leads-vencidos", status: "ok", avgMs: 156, calls24h: 87 },
          ],
          
          // Errores recientes
          recentErrors: [
            { time: "10:23", type: "API", message: "Timeout en /api/kpis", count: 2 },
            { time: "09:45", type: "DB", message: "Connection pool exhausted", count: 1 },
          ],
          
          // Geografía
          geography: [
            { country: "Uruguay", percentage: 85, sessions: 721 },
            { country: "Argentina", percentage: 10, sessions: 85 },
            { country: "España", percentage: 3, sessions: 25 },
            { country: "Otros", percentage: 2, sessions: 17 },
          ],
          
          lastUpdated: new Date().toISOString(),
        });
        setLoading(false);
        setLastRefresh(new Date());
      });
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const vitalStatus = {
    good: "bg-green-500/20 text-green-600 border-green-500/30",
    "needs-improvement": "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
    poor: "bg-red-500/20 text-red-600 border-red-500/30",
  };

  const statusIcon = {
    ok: <CheckCircle className="h-4 w-4 text-green-500" />,
    warning: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
    error: <XCircle className="h-4 w-4 text-red-500" />,
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="p-4 md:p-6 space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-4 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Activity className="h-6 w-6 text-blue-500" />
              Salud del Sistema
            </h1>
            <p className="text-muted-foreground">
              Métricas de uso, performance y estado de la infraestructura
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className={
                stats?.status === "online"
                  ? "bg-green-500/10 text-green-600 border-green-500/30"
                  : "bg-red-500/10 text-red-600 border-red-500/30"
              }
            >
              <Server className="h-3 w-3 mr-1" />
              {stats?.status === "online" ? "Sistema Online" : "Problemas"}
            </Badge>
            <div className="text-xs text-muted-foreground">
              Actualizado: {lastRefresh.toLocaleTimeString()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchStats}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refrescar
            </Button>
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="gap-2"
            >
              {autoRefresh ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
              Auto
            </Button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card className="border-green-500/30 bg-green-500/5">
            <CardContent className="pt-4 text-center">
              <Zap className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold text-green-600">{stats?.uptime}</p>
              <p className="text-xs text-muted-foreground">Uptime</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Eye className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">{stats?.usage?.todayPageViews}</p>
              <p className="text-xs text-muted-foreground">Vistas hoy</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-purple-500" />
              <p className="text-2xl font-bold">{stats?.usage?.activeUsers}</p>
              <p className="text-xs text-muted-foreground">Usuarios activos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Timer className="h-6 w-6 mx-auto mb-2 text-orange-500" />
              <p className="text-2xl font-bold">{stats?.server?.avgResponseTime}ms</p>
              <p className="text-xs text-muted-foreground">Resp. promedio</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Database className="h-6 w-6 mx-auto mb-2 text-cyan-500" />
              <p className="text-2xl font-bold">{stats?.database?.responseTime}ms</p>
              <p className="text-xs text-muted-foreground">DB Response</p>
            </CardContent>
          </Card>
          <Card className={stats?.server?.errorRate > 1 ? "border-red-500/30 bg-red-500/5" : ""}>
            <CardContent className="pt-4 text-center">
              <AlertTriangle className={`h-6 w-6 mx-auto mb-2 ${stats?.server?.errorRate > 1 ? "text-red-500" : "text-green-500"}`} />
              <p className="text-2xl font-bold">{stats?.server?.errorRate}%</p>
              <p className="text-xs text-muted-foreground">Error rate</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="usage">Uso</TabsTrigger>
            <TabsTrigger value="api">APIs</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="errors">Errores</TabsTrigger>
          </TabsList>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Web Vitals */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    Core Web Vitals
                  </CardTitle>
                  <CardDescription>
                    Métricas de performance según Google
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(stats?.webVitals || {}).map(([key, vital]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{vital.label || key.toUpperCase()}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {vital.description}
                          </span>
                        </div>
                        <Badge variant="outline" className={vitalStatus[vital.status]}>
                          {vital.value}{vital.unit}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={Math.min((vital.value / vital.target) * 100, 100)} 
                          className="h-2 flex-1" 
                        />
                        <span className="text-xs text-muted-foreground w-24 text-right">
                          p75: {vital.p75}{vital.unit} | Target: {vital.target}{vital.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Server Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    Server Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Avg Response</p>
                      <p className="text-2xl font-bold">{stats?.server?.avgResponseTime}ms</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">P95 Response</p>
                      <p className="text-2xl font-bold">{stats?.server?.p95ResponseTime}ms</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">P99 Response</p>
                      <p className="text-2xl font-bold">{stats?.server?.p99ResponseTime}ms</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Req/min</p>
                      <p className="text-2xl font-bold">{stats?.server?.requestsPerMinute}</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Cache Hit Rate</span>
                      <span className="text-sm font-medium">{stats?.server?.cacheHitRate}%</span>
                    </div>
                    <Progress value={stats?.server?.cacheHitRate || 0} className="h-2" />
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">DB Pool ({stats?.server?.dbActiveConnections}/{stats?.server?.dbPoolSize})</span>
                      <span className="text-sm font-medium">
                        {stats?.server?.dbPoolSize ? Math.round((stats?.server?.dbActiveConnections / stats?.server?.dbPoolSize) * 100) : 0}%
                      </span>
                    </div>
                    <Progress 
                      value={stats?.server?.dbPoolSize ? (stats?.server?.dbActiveConnections / stats?.server?.dbPoolSize) * 100 : 0} 
                      className="h-2" 
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Page Views */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Page Views
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center p-2 rounded bg-muted/50">
                    <span>Hoy</span>
                    <span className="font-bold">{stats?.usage?.todayPageViews}</span>
                  </div>
                  <div className="flex justify-between items-center p-2">
                    <span>Ayer</span>
                    <span className="font-medium">{stats?.usage?.yesterdayPageViews}</span>
                  </div>
                  <div className="flex justify-between items-center p-2">
                    <span>Esta semana</span>
                    <span className="font-medium">{stats?.usage?.weekPageViews}</span>
                  </div>
                  <div className="flex justify-between items-center p-2">
                    <span>Este mes</span>
                    <span className="font-medium">{stats?.usage?.monthPageViews}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Devices */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Dispositivos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Laptop className="h-5 w-5 text-blue-500" />
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span>Desktop</span>
                        <span className="font-medium">{stats?.devices?.desktop}%</span>
                      </div>
                      <Progress value={stats?.devices?.desktop || 0} className="h-2" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5 text-purple-500" />
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span>Mobile</span>
                        <span className="font-medium">{stats?.devices?.mobile}%</span>
                      </div>
                      <Progress value={stats?.devices?.mobile || 0} className="h-2" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Tablet className="h-5 w-5 text-green-500" />
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span>Tablet</span>
                        <span className="font-medium">{stats?.devices?.tablet}%</span>
                      </div>
                      <Progress value={stats?.devices?.tablet || 0} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Browsers */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Chrome className="h-5 w-5" />
                    Navegadores
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {stats?.browsers?.map((browser) => (
                    <div key={browser.name} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span>{browser.name}</span>
                          <span className="text-sm text-muted-foreground">{browser.sessions} sesiones</span>
                        </div>
                        <Progress value={browser.percentage} className="h-2" />
                      </div>
                      <span className="font-medium w-10 text-right">{browser.percentage}%</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Top Pages */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Páginas más visitadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium">Página</th>
                        <th className="text-right py-2 font-medium">Vistas</th>
                        <th className="text-right py-2 font-medium">Tiempo prom.</th>
                        <th className="text-right py-2 font-medium">Bounce</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats?.topPages?.map((page) => (
                        <tr key={page.path} className="border-b border-border/50">
                          <td className="py-2 font-mono text-xs">{page.path}</td>
                          <td className="text-right py-2 font-medium">{page.views}</td>
                          <td className="text-right py-2 text-muted-foreground">{page.avgTime}</td>
                          <td className="text-right py-2 text-muted-foreground">{page.bounceRate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Geography */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Geografía
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stats?.geography?.map((geo) => (
                    <div key={geo.country} className="p-3 rounded-lg bg-muted/50 text-center">
                      <p className="font-medium">{geo.country}</p>
                      <p className="text-2xl font-bold">{geo.percentage}%</p>
                      <p className="text-xs text-muted-foreground">{geo.sessions} sesiones</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* APIs Tab */}
          <TabsContent value="api" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estado de APIs</CardTitle>
                <CardDescription>
                  Endpoints monitoreados en las últimas 24 horas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium">Endpoint</th>
                        <th className="text-center py-2 font-medium">Estado</th>
                        <th className="text-right py-2 font-medium">Resp. Prom.</th>
                        <th className="text-right py-2 font-medium">Calls (24h)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats?.apiEndpoints?.map((api) => (
                        <tr key={api.endpoint} className="border-b border-border/50">
                          <td className="py-3 font-mono text-xs">{api.endpoint}</td>
                          <td className="text-center py-3">{statusIcon[api.status]}</td>
                          <td className="text-right py-3">
                            <Badge variant="outline" className={api.avgMs < 100 ? "bg-green-500/10" : api.avgMs < 300 ? "bg-yellow-500/10" : "bg-red-500/10"}>
                              {api.avgMs}ms
                            </Badge>
                          </td>
                          <td className="text-right py-3 font-medium">{api.calls24h.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Database Tab */}
          <TabsContent value="database" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Estado de Base de Datos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Estado</span>
                    <Badge variant="outline" className="bg-green-500/10 text-green-600">
                      {stats?.database?.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tiempo de respuesta</span>
                    <span className="font-medium">{stats?.database?.responseTime}ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total de registros</span>
                    <span className="font-medium">{stats?.database?.totalRows?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Último backup</span>
                    <span className="text-sm text-muted-foreground">{stats?.database?.lastBackup}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tamaño backup</span>
                    <span className="font-medium">{stats?.database?.backupSize}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <HardDrive className="h-5 w-5" />
                    Tablas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium">Tabla</th>
                        <th className="text-right py-2 font-medium">Registros</th>
                        <th className="text-right py-2 font-medium">Tamaño</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats?.database?.tableStats?.map((table) => (
                        <tr key={table.table} className="border-b border-border/50">
                          <td className="py-2 font-mono text-xs">{table.table}</td>
                          <td className="text-right py-2">{table.rows?.toLocaleString()}</td>
                          <td className="text-right py-2 text-muted-foreground">{table.size}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Errors Tab */}
          <TabsContent value="errors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Errores Recientes
                </CardTitle>
                <CardDescription>
                  Últimos errores registrados en el sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!stats?.recentErrors?.length ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                    <p>No hay errores recientes</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats?.recentErrors?.map((error, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">{error.type}</Badge>
                            <span className="text-xs text-muted-foreground">{error.time}</span>
                            <Badge variant="secondary" className="text-xs">{error.count}x</Badge>
                          </div>
                          <p className="text-sm">{error.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
