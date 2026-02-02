import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { KPICards } from '@/components/dashboard/kpi-cards'
import { FunnelChart } from '@/components/dashboard/funnel-chart'
import { ActivityChart } from '@/components/dashboard/activity-chart'
import { ChannelChart } from '@/components/dashboard/channel-chart'
import { CourseChart } from '@/components/dashboard/course-chart'
import { ExpiredLeadsTable } from '@/components/dashboard/expired-leads-table'
import { AdvisorPerformance } from '@/components/dashboard/advisor-performance'

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <DashboardHeader />

        <section className="mt-8">
          <KPICards />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <FunnelChart />
          <ActivityChart />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <ChannelChart />
          <CourseChart />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ExpiredLeadsTable />
          </div>
          <AdvisorPerformance />
        </section>
      </div>
    </main>
  )
}
