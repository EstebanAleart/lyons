import { AppLayout } from "@/components/dashboard/app-layout";
import { DashboardLoading } from "@/components/dashboard/loading-skeletons";

export default function Loading() {
  return (
    <AppLayout>
      <main className="p-4 md:p-6">
        <div className="mb-6">
          <div className="h-8 w-48 bg-muted rounded animate-pulse mb-2"></div>
          <div className="h-4 w-64 bg-muted rounded animate-pulse"></div>
        </div>
        <DashboardLoading />
      </main>
    </AppLayout>
  );
}
