import { Sidebar } from "@/components/sidebar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquare, LineChart, Book, ArrowRight } from "lucide-react";
import { ChatModal } from "@/components/chat-modal";

export default function Home() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-auto">
          <div className="container max-w-4xl py-12">
            <div className="space-y-8">
              <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Quote Validation Assistant
                </h1>
                <p className="text-lg text-muted-foreground">
                  Intelligent validation for hardware and software quotes
                </p>
              </div>
              
              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
                  <div className="p-6 flex flex-col items-center text-center space-y-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <MessageSquare className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">Start a New Chat</h3>
                      <p className="text-sm text-muted-foreground">
                        Ask questions about your quote or upload a document for validation
                      </p>
                    </div>
                    <Link href="/chat/new" className="w-full">
                      <Button className="w-full">
                        New Conversation
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
                
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
                  <div className="p-6 flex flex-col items-center text-center space-y-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <LineChart className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">View Analytics</h3>
                      <p className="text-sm text-muted-foreground">
                        Explore usage stats, common issues, and validation metrics
                      </p>
                    </div>
                    <Link href="/analytics" className="w-full">
                      <Button variant="outline" className="w-full">
                        View Analytics
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
                
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
                  <div className="p-6 flex flex-col items-center text-center space-y-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Book className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">Documentation</h3>
                      <p className="text-sm text-muted-foreground">
                        Learn about validation rules, compatibility matrices, and more
                      </p>
                    </div>
                    <Link href="/docs" className="w-full">
                      <Button variant="outline" className="w-full">
                        View Documentation
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg border bg-card p-6">
                <h2 className="text-xl font-bold mb-4">
                  How the Quote Validation Assistant Helps You
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex gap-2">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold">1</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Configuration Completeness</h3>
                      <p className="text-sm text-muted-foreground">
                        Automatically detect missing components or licenses
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold">2</span>
                    </div>
                    <div>
                      <h3 className="font-medium">End-of-Sale Detection</h3>
                      <p className="text-sm text-muted-foreground">
                        Find EOS SKUs and get suggested alternatives
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold">3</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Compatibility Checking</h3>
                      <p className="text-sm text-muted-foreground">
                        Verify technical compatibility between components
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold">4</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Expert Recommendations</h3>
                      <p className="text-sm text-muted-foreground">
                        Get suggestions for optimizing your configuration
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Add the chat modal component */}
      <ChatModal />
    </div>
  );
}