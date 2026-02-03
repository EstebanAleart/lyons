import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Pool } from "pg"
import { Navbar } from "@/components/dashboard/navbar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { FunnelChart } from "@/components/dashboard/funnel-chart";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { ChannelChart } from "@/components/dashboard/channel-chart";
import { CourseChart } from "@/components/dashboard/course-chart";
import { ExpiredLeadsTable } from "@/components/dashboard/expired-leads-table";
import { AdvisorPerformance } from "@/components/dashboard/advisor-performance";
import { RecentContactsTable } from "@/components/dashboard/recent-contacts-table";

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: 5432,
})

export default async function DashboardPage() {
  const session = await auth()
  
  // Si no está autenticado, redirigir al home
  if (!session) {
    redirect("/")
  }
  
  let userData
  
  try {
    // Verificar/crear usuario en la base de datos
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [session.user.email]
    )
    
    if (result.rows.length === 0) {
      // Crear usuario nuevo con rol 'usuario' y activo false
      await pool.query(
        'INSERT INTO usuarios (nombre, email, rol, activo) VALUES ($1, $2, $3, $4)',
        [session.user.name, session.user.email, 'usuario', false]
      )
      userData = { rol: 'usuario', activo: false }
    } else {
      userData = result.rows[0]
    }
  } catch (error) {
    console.error("Error al verificar usuario:", error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error al cargar el dashboard</h1>
          <p className="text-muted-foreground">Por favor, intenta de nuevo más tarde.</p>
        </div>
      </div>
    )
  }
  
  // Verificar que sea asesor activo - FUERA DEL TRY-CATCH
  if (userData.rol !== "asesor" || !userData.activo) {
    redirect("/no-autorizado")
  }
  
  // Usuario autorizado - mostrar dashboard
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="p-4 md:p-6 space-y-6">
        <DashboardHeader />
        <KpiCards />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FunnelChart />
          <ActivityChart />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChannelChart />
          <CourseChart />
          <AdvisorPerformance />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ExpiredLeadsTable />
          <RecentContactsTable />
        </div>
      </main>
    </div>
  );
}