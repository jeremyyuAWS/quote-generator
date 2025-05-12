"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  PlusCircle,
  MessageSquare,
  BarChart4,
  Trash2,
  Settings,
  FileBarChart2,
  Book,
  Network,
  Calculator,
} from "lucide-react";
import { useApp } from "./app-provider";
import { cn } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";

export function Sidebar() {
  const { chats, activeChat, setActiveChat, addChat, deleteChat } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleNewChat = () => {
    const newChat = addChat();
    router.push(`/chat/${newChat.id}`);
  };

  const handleChatSelect = (chatId: string) => {
    const chat = chats.find((c) => c.id === chatId);
    if (chat) {
      setActiveChat(chat);
      router.push(`/chat/${chatId}`);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    setDeleteConfirm(chatId);
  };

  const handleDeleteConfirm = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    deleteChat(chatId);
    setDeleteConfirm(null);
    if (pathname.includes(chatId)) {
      router.push("/");
    }
  };

  const handleDeleteCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirm(null);
  };

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <h2 className="text-lg font-semibold">Quote Assistant</h2>
      </div>
      
      <div className="p-4">
        <Button
          onClick={handleNewChat}
          className="w-full justify-start gap-2"
          variant="default"
        >
          <PlusCircle size={16} />
          New Chat
        </Button>
      </div>
      
      <nav className="flex-1 overflow-auto pt-2">
        <ScrollArea className="h-[calc(100vh-13rem)]">
          <div className="space-y-2 px-3">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={cn(
                  "flex flex-col rounded-md px-3 py-2 text-sm transition-colors",
                  activeChat?.id === chat.id
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/50"
                )}
                onClick={() => handleChatSelect(chat.id)}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={16} />
                    <span className="truncate">{chat.title}</span>
                  </div>
                  {deleteConfirm !== chat.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={(e) => handleDeleteClick(e, chat.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                  {deleteConfirm === chat.id && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => handleDeleteConfirm(e, chat.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={handleDeleteCancel}
                      >
                        ×
                      </Button>
                    </div>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(chat.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </nav>
      
      <div className="flex flex-col gap-1 p-4 border-t">
        <Button
          variant="ghost"
          size="sm"
          className="justify-start gap-2"
          onClick={() => router.push("/comparison")}
        >
          <FileBarChart2 size={16} />
          Compare Quotes
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="justify-start gap-2"
          onClick={() => router.push("/topology")}
        >
          <Network size={16} />
          Network Topology
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="justify-start gap-2"
          onClick={() => router.push("/roi")}
        >
          <Calculator size={16} />
          ROI Calculator
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="justify-start gap-2"
          onClick={() => router.push("/analytics")}
        >
          <BarChart4 size={16} />
          Analytics
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="justify-start gap-2"
          onClick={() => router.push("/docs")}
        >
          <Book size={16} />
          Documentation
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="justify-start gap-2"
          onClick={() => router.push("/settings")}
        >
          <Settings size={16} />
          Settings
        </Button>
      </div>
    </div>
  );
}