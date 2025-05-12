import { Sidebar } from "@/components/sidebar";
import { ROICalculator } from "@/components/roi-calculator";

export default function ROIPage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="h-14 border-b flex items-center px-6">
          <h1 className="text-lg font-semibold">ROI Calculator</h1>
        </div>
        <main className="flex-1 overflow-auto">
          <div className="container py-6">
            <ROICalculator />
          </div>
        </main>
      </div>
    </div>
  );
}