import { Sidebar } from "@/components/sidebar";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";

export default function AnalyticsPage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="h-14 border-b flex items-center px-6">
          <h1 className="text-lg font-semibold">Analytics Dashboard</h1>
        </div>
        <main className="flex-1 overflow-auto">
          <AnalyticsDashboard />
        </main>
      </div>
    </div>
  );
}