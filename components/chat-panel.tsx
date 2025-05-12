"use client";

import { useState, useRef, useEffect } from "react";
import { useApp } from "./app-provider";
import { Message } from "./message";
import { FileUpload } from "./file-upload";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Upload } from "lucide-react";
import { generateSyntheticResponse } from "@/lib/validation";
import { Message as MessageType } from "@/types/chat";
import { AnimatedStreaming } from "./animated-streaming";

export function ChatPanel() {
  const { activeChat, addMessage, addFile, loading, setLoading } = useApp();
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [showFileUpload, setShowFileUpload] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages, streamingText]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const handleSend = async () => {
    if (!input.trim() || !activeChat) return;
    
    // Add user message
    const userMessage: MessageType = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      createdAt: new Date().toISOString(),
    };
    
    addMessage(activeChat.id, userMessage);
    setInput("");
    setLoading(true);
    
    // Simulate streaming response
    setIsStreaming(true);
    setStreamingText("");
    
    // Generate synthetic response
    const response = generateSyntheticResponse(input);
    const fullText = response.response;
    
    // Simulate streaming by revealing one character at a time
    let currentIndex = 0;
    const streamInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setStreamingText(fullText.substring(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(streamInterval);
        setIsStreaming(false);
        
        // Add the complete assistant message
        const assistantMessage: MessageType = {
          id: Date.now().toString(),
          role: "assistant",
          content: fullText,
          createdAt: new Date().toISOString(),
          confidence: response.confidence,
          citations: response.citations,
          tags: response.tags,
        };
        
        addMessage(activeChat.id, assistantMessage);
        setLoading(false);
      }
    }, 10); // Speed of typing simulation
    
    return () => clearInterval(streamInterval);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleFeedback = (messageId: string, feedback: "positive" | "negative") => {
    // In a real app, this would send feedback to the server
    console.log(`Feedback for ${messageId}: ${feedback}`);
  };
  
  const handleFileUploadComplete = (fileName: string, fileType: string, fileSize: number) => {
    if (!activeChat) return;
    
    // Add file to the chat
    addFile(activeChat.id, {
      id: Date.now().toString(),
      name: fileName,
      type: fileType as any,
      size: fileSize,
      createdAt: new Date().toISOString(),
    });
    
    // Add a system message about the file
    const fileMessage: MessageType = {
      id: Date.now().toString(),
      role: "user",
      content: `Uploaded file: ${fileName}`,
      createdAt: new Date().toISOString(),
    };
    
    addMessage(activeChat.id, fileMessage);
    setShowFileUpload(false);
    
    // Auto-generate a response about the file
    setLoading(true);
    
    setTimeout(() => {
      const assistantMessage: MessageType = {
        id: Date.now().toString(),
        role: "assistant",
        content: `I've received your file "${fileName}". This appears to be a ${fileType} document. Would you like me to analyze this quote for validation, or is there something specific you'd like me to check?`,
        createdAt: new Date().toISOString(),
        confidence: 0.9,
      };
      
      addMessage(activeChat.id, assistantMessage);
      setLoading(false);
    }, 1500);
  };
  
  if (!activeChat) {
    return <div className="flex-1 p-8 text-center">Select a chat or start a new one</div>;
  }
  
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="flex flex-col p-4">
            {activeChat.messages.map((message) => (
              <Message
                key={message.id}
                message={message}
                onFeedback={handleFeedback}
              />
            ))}
            
            {isStreaming && (
              <div className="group relative mb-4 flex w-full items-start gap-4 px-4">
                <div className="max-w-3xl space-y-2 rounded-md bg-muted p-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-medium">Assistant</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <AnimatedStreaming text={streamingText} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>
      
      {showFileUpload ? (
        <div className="border-t p-4">
          <FileUpload 
            onUploadComplete={handleFileUploadComplete}
            onCancel={() => setShowFileUpload(false)}
          />
        </div>
      ) : (
        <div className="border-t p-4">
          <div className="flex items-end gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFileUpload(true)}
              className="flex-shrink-0"
            >
              <Upload size={18} />
            </Button>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your quote configuration..."
              className="min-h-[60px] resize-none"
              disabled={loading || isStreaming}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || loading || isStreaming}
              className="flex-shrink-0"
            >
              {loading || isStreaming ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}