"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Chat, Message } from "@/types/chat";
import { UploadedFile } from "@/types/file";
import { createInitialChats } from "@/lib/initial-data";

interface AppContextType {
  chats: Chat[];
  activeChat: Chat | null;
  setActiveChat: (chat: Chat) => void;
  addChat: () => Chat;
  deleteChat: (id: string) => void;
  addMessage: (chatId: string, message: Message) => void;
  addFile: (chatId: string, file: UploadedFile) => void;
  files: UploadedFile[];
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Initialize with sample data on client side
    if (!initialized) {
      const initialChats = createInitialChats();
      setChats(initialChats);
      setActiveChat(initialChats[0]);
      setInitialized(true);
    }
  }, [initialized]);

  const addChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: "New Chat",
      createdAt: new Date().toISOString(),
      messages: [],
      files: [],
    };
    setChats((prev) => [...prev, newChat]);
    setActiveChat(newChat);
    return newChat;
  };

  const deleteChat = (id: string) => {
    setChats((prev) => prev.filter((chat) => chat.id !== id));
    if (activeChat?.id === id) {
      setActiveChat(chats[0] || null);
    }
  };

  const addMessage = (chatId: string, message: Message) => {
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === chatId) {
          return {
            ...chat,
            messages: [...chat.messages, message],
            title: chat.messages.length === 0 ? message.content.slice(0, 30) + "..." : chat.title,
          };
        }
        return chat;
      })
    );
  };

  const addFile = (chatId: string, file: UploadedFile) => {
    setFiles((prev) => [...prev, file]);
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === chatId) {
          return {
            ...chat,
            files: [...chat.files, file.id],
          };
        }
        return chat;
      })
    );
  };

  return (
    <AppContext.Provider
      value={{
        chats,
        activeChat,
        setActiveChat,
        addChat,
        deleteChat,
        addMessage,
        addFile,
        files,
        loading,
        setLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}