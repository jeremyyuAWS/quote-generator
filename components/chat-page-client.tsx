"use client";

import { useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { ChatPanel } from "@/components/chat-panel";
import { useApp } from "@/components/app-provider";
import { useRouter } from "next/navigation";
import { generateSyntheticResponse } from "@/lib/validation";

export function ChatPageClient({ params }: { params: { id: string } }) {
  const { chats, activeChat, setActiveChat, addChat, addMessage } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (params.id === "new") {
      const newChat = addChat();
      router.replace(`/chat/${newChat.id}`);
    } else {
      const chat = chats.find((c) => c.id === params.id);
      if (chat) {
        setActiveChat(chat);
      } else if (chats.length > 0) {
        router.replace(`/chat/${chats[0].id}`);
      } else {
        const newChat = addChat();
        router.replace(`/chat/${newChat.id}`);
      }
    }
  }, [params.id, chats, setActiveChat, addChat, router]);

  // If no messages in chat, add welcome message
  useEffect(() => {
    if (activeChat && activeChat.messages.length === 0) {
      const response = generateSyntheticResponse("welcome");
      
      const assistantMessage = {
        id: Date.now().toString(),
        role: "assistant" as const,
        content: "Welcome to the Quote Validation Assistant! I can help you validate your hardware and software quotes, check for compatibility issues, and suggest alternatives for end-of-sale products. How can I assist you today?",
        createdAt: new Date().toISOString(),
        confidence: 0.95,
      };
      
      addMessage(activeChat.id, assistantMessage);
    }
  }, [activeChat, addMessage]);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-hidden">
          <ChatPanel />
        </main>
      </div>
    </div>
  );
}