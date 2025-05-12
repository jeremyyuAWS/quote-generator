import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="h-14 border-b flex items-center px-6">
          <h1 className="text-lg font-semibold">Settings</h1>
        </div>
        <main className="flex-1 overflow-auto">
          <div className="container max-w-4xl py-6">
            <Tabs defaultValue="general">
              <TabsList className="mb-6">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="validation">Validation Rules</TabsTrigger>
                <TabsTrigger value="integrations">Integrations</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Interface</CardTitle>
                    <CardDescription>
                      Customize how the application looks and behaves
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="show-confidence">Show confidence scores</Label>
                        <p className="text-sm text-muted-foreground">
                          Display confidence metrics for validation results
                        </p>
                      </div>
                      <Switch id="show-confidence" defaultChecked />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="show-citations">Show citations</Label>
                        <p className="text-sm text-muted-foreground">
                          Display source references for validation data
                        </p>
                      </div>
                      <Switch id="show-citations" defaultChecked />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="streaming-responses">Streaming responses</Label>
                        <p className="text-sm text-muted-foreground">
                          Show assistant responses as they are generated
                        </p>
                      </div>
                      <Switch id="streaming-responses" defaultChecked />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Chat History</CardTitle>
                    <CardDescription>
                      Manage your conversation data
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="save-history">Save chat history</Label>
                        <p className="text-sm text-muted-foreground">
                          Persist conversations between sessions
                        </p>
                      </div>
                      <Switch id="save-history" defaultChecked />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="destructive">Clear All History</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="validation" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Validation Sources</CardTitle>
                    <CardDescription>
                      Configure data sources for product validation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="use-official-data">Use official product data</Label>
                        <p className="text-sm text-muted-foreground">
                          Validate against official product documentation
                        </p>
                      </div>
                      <Switch id="use-official-data" defaultChecked />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="check-eos">Check End-of-Sale status</Label>
                        <p className="text-sm text-muted-foreground">
                          Verify if products are discontinued or end-of-sale
                        </p>
                      </div>
                      <Switch id="check-eos" defaultChecked />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="suggest-alternatives">Suggest alternatives</Label>
                        <p className="text-sm text-muted-foreground">
                          Recommend replacement products when issues are found
                        </p>
                      </div>
                      <Switch id="suggest-alternatives" defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="integrations" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>External Integrations</CardTitle>
                    <CardDescription>
                      Connect with external services and data sources
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="api-integration">External API Integration</Label>
                        <p className="text-sm text-muted-foreground">
                          Connect to product catalog APIs
                        </p>
                      </div>
                      <Switch id="api-integration" />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="pricing-data">Include pricing data</Label>
                        <p className="text-sm text-muted-foreground">
                          Include pricing information in validation results
                        </p>
                      </div>
                      <Switch id="pricing-data" />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline">Configure API Keys</Button>
                    <Button>Save Changes</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}