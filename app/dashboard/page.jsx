import { Navbar } from "@/components/dashboard/navbar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { FunnelChart } from "@/components/dashboard/funnel-chart";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { ChannelChart } from "@/components/dashboard/channel-chart";
import { CourseChart } from "@/components/dashboard/course-chart";
import { ExpiredLeadsTable } from "@/components/dashboard/expired-leads-table";
import { AdvisorPerformance } from "@/components/dashboard/advisor-performance";
import { SystemHealth } from "@/components/dashboard/system-health";

export default function DashboardPage() {
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

        <ExpiredLeadsTable />
        
        {/* Métricas de sistema - separadas de métricas de negocio */}
        <SystemHealth />
      </main>
    </div>
  );
}
