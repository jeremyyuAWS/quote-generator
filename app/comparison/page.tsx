import { Sidebar } from "@/components/sidebar";
import { QuoteComparisonTable } from "@/components/quote-comparison-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ComparisonPage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="h-14 border-b flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold">Quote Comparison</h1>
          <Button variant="outline" size="sm" className="gap-1">
            <PlusCircle size={16} />
            Add Quote
          </Button>
        </div>
        <main className="flex-1 overflow-auto">
          <div className="container py-6">
            <Tabs defaultValue="hardware" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="hardware">Hardware</TabsTrigger>
                <TabsTrigger value="software">Software</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
              </TabsList>
              
              <TabsContent value="hardware" className="space-y-6">
                <QuoteComparisonTable />
              </TabsContent>
              
              <TabsContent value="software" className="space-y-6">
                <div className="rounded-lg border p-8 text-center">
                  <p className="text-muted-foreground">
                    Select software quotes to compare
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="services" className="space-y-6">
                <div className="rounded-lg border p-8 text-center">
                  <p className="text-muted-foreground">
                    Select service quotes to compare
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}