import { Navbar } from "@/components/dashboard/navbar";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-32 bg-muted rounded animate-pulse mb-2"></div>
            <div className="h-4 w-48 bg-muted rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
        </div>
        
        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex gap-4">
            <div className="h-10 flex-1 bg-muted rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted/50 p-4 flex gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-4 w-24 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="p-4 border-t flex gap-4 items-center">
              <div className="h-10 w-10 bg-muted rounded-full animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
                <div className="h-3 w-48 bg-muted rounded animate-pulse"></div>
              </div>
              <div className="h-6 w-20 bg-muted rounded animate-pulse"></div>
              <div className="h-6 w-16 bg-muted rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
