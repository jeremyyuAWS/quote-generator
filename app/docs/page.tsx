import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function DocsPage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="h-14 border-b flex items-center px-6">
          <h1 className="text-lg font-semibold">Documentation</h1>
        </div>
        <main className="flex-1 overflow-auto">
          <div className="container max-w-4xl py-6 space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">Quote Validation Assistant Documentation</h2>
              <p className="text-lg text-muted-foreground">
                Learn how to use the assistant to validate and optimize your quotes
              </p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Validation Rules</CardTitle>
                <CardDescription>
                  Core rules used to validate hardware and software configurations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Completeness Rules</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <span className="font-medium">Access Points</span>: Require power source (PoE switch or injector), licenses, and controller
                    </li>
                    <li>
                      <span className="font-medium">Controllers</span>: Must have sufficient AP capacity licenses
                    </li>
                    <li>
                      <span className="font-medium">Switches</span>: Need appropriate power budget for connected devices
                    </li>
                  </ul>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Compatibility Matrix</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Component</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Power</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Compatible Controllers</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        <tr>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm font-medium">AP-300</div>
                              <Badge variant="outline" className="ml-2">Current</Badge>
                            </div>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">PoE+ (802.3at)</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">CTRL-V2, CTRL-V3, Cloud</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm font-medium">AP-500</div>
                              <Badge variant="outline" className="ml-2">Current</Badge>
                            </div>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">PoE++ (802.3bt)</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">CTRL-V3, Cloud</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm font-medium">AP-100</div>
                              <Badge variant="destructive" className="ml-2">EOS</Badge>
                            </div>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">PoE (802.3af)</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">CTRL-V1, CTRL-V2</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-2">End-of-Sale (EOS) Products</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">SKU</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">EOS Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Replacement</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        <tr>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">SW-1200-24</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">May 15, 2023</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">SW-2400-24</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">AP-100</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">Nov 30, 2022</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">AP-300</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">CTRL-V1</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">Feb 28, 2023</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">CTRL-V3</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Using the Quote Validation Assistant</CardTitle>
                <CardDescription>
                  How to get the most out of the assistant
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Validation Queries</h3>
                  <p className="mb-2 text-muted-foreground">
                    The assistant can analyze your quote in several ways:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <span className="font-medium">Upload a document</span>: Upload your quote in PDF, DOCX, or other supported formats
                    </li>
                    <li>
                      <span className="font-medium">Type SKUs directly</span>: List the SKUs you want to validate in your message
                    </li>
                    <li>
                      <span className="font-medium">Describe your needs</span>: Explain your requirements and get product recommendations
                    </li>
                  </ul>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Example Queries</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>"Can you validate this quote for 5 AP-300s and 1 SW-24P switch?"</li>
                    <li>"Is the SW-1200-24 still available or is it end-of-sale?"</li>
                    <li>"What licenses do I need for 10 AP-500 access points?"</li>
                    <li>"Check if these components are compatible: CTRL-V2, AP-500, SW-48P"</li>
                    <li>"I need a solution for a small office with 25 employees, what do you recommend?"</li>
                  </ul>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Feedback</h3>
                  <p className="text-muted-foreground">
                    Use the thumbs up/down buttons to provide feedback on responses. This helps improve the assistant's accuracy over time.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}