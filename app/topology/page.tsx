import { Sidebar } from "@/components/sidebar";
import { NetworkTopologyVisualizer } from "@/components/network-topology-visualizer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TopologyPage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="h-14 border-b flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold">Network Topology Visualizer</h1>
          <div className="flex items-center gap-4">
            <Select defaultValue="quote-b">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select quote" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quote-a">Quote A</SelectItem>
                <SelectItem value="quote-b">Quote B (Recommended)</SelectItem>
                <SelectItem value="quote-c">Quote C</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <main className="flex-1 overflow-auto">
          <div className="container py-6">
            <Tabs defaultValue="logical" className="w-full">
              <div className="flex justify-between mb-6">
                <TabsList>
                  <TabsTrigger value="logical">Logical View</TabsTrigger>
                  <TabsTrigger value="physical">Physical View</TabsTrigger>
                  <TabsTrigger value="layers">Layer View</TabsTrigger>
                </TabsList>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="show-labels" defaultChecked />
                    <Label htmlFor="show-labels">Show Labels</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="show-connections" defaultChecked />
                    <Label htmlFor="show-connections">Show Connections</Label>
                  </div>
                </div>
              </div>
              
              <TabsContent value="logical" className="space-y-6">
                <NetworkTopologyVisualizer />
              </TabsContent>
              
              <TabsContent value="physical" className="space-y-6">
                <div className="rounded-lg border p-8 text-center">
                  <p className="text-muted-foreground">
                    Physical view coming soon
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="layers" className="space-y-6">
                <div className="rounded-lg border p-8 text-center">
                  <p className="text-muted-foreground">
                    Layer view coming soon
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