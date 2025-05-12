"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, X } from "lucide-react";

export function ChatModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Chat button fixed to bottom right */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed right-4 bottom-4 rounded-full p-3 shadow-lg"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>

      {/* Chat modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Quick Chat</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="mb-4 h-80 overflow-y-auto rounded border p-3">
              <p className="text-muted-foreground">
                How can I help you with your quote today?
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button>Send</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}