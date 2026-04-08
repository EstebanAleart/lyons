import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { AppLayout } from "@/components/dashboard/app-layout";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { FunnelChart } from "@/components/dashboard/funnel-chart";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { ChannelChart } from "@/components/dashboard/channel-chart";
import { CourseChart } from "@/components/dashboard/course-chart";
import { ExpiredLeadsTable } from "@/components/dashboard/expired-leads-table";
import { RecentContactsTable } from "@/components/dashboard/recent-contacts-table";

export default async function DashboardPage() {
  const session = await auth()

  // Si no está autenticado, redirigir al home
  if (!session) {
    redirect("/")
  }

  let userData

  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', session.user.email)
      .single()

    if (error && error.code === 'PGRST116') {
      // Usuario no existe, crearlo
      await supabase.from('usuarios').insert({
        nombre: session.user.name,
        email: session.user.email,
        rol: 'usuario',
        activo: false
      })
      userData = { rol: 'usuario', activo: false }
    } else if (error) {
      throw error
    } else {
      userData = data
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
  
  // Verificar que sea admin o asesor activo
  const rolesPermitidos = ["asesor", "admin"]
  if (!rolesPermitidos.includes(userData.rol) || !userData.activo) {
    redirect("/no-autorizado")
  }

  // Usuario autorizado - mostrar dashboard
  return (
    <AppLayout userRol={userData.rol}>
      <main className="p-4 md:p-6 space-y-6">
        <DashboardHeader />
        <KpiCards />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FunnelChart />
          <ActivityChart />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChannelChart />
          <CourseChart />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ExpiredLeadsTable />
          <RecentContactsTable />
        </div>
      </main>
    </AppLayout>
  );
}