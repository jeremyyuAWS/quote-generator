"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ThumbsUp,
  ThumbsDown,
  Copy,
  ExternalLink,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Message as MessageType, Citation } from "@/types/chat";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface MessageProps {
  message: MessageType;
  onFeedback?: (messageId: string, feedback: "positive" | "negative") => void;
}

export function Message({ message, onFeedback }: MessageProps) {
  const { toast } = useToast();
  const [feedback, setFeedback] = useState<"positive" | "negative" | null>(
    message.feedback || null
  );

  const isUser = message.role === "user";
  
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    toast({
      description: "Message copied to clipboard",
    });
  };

  const handleFeedback = (type: "positive" | "negative") => {
    setFeedback(type);
    if (onFeedback) {
      onFeedback(message.id, type);
    }
  };

  return (
    <div
      className={cn(
        "group relative mb-4 flex w-full items-start gap-4 px-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <Card
        className={cn(
          "max-w-3xl space-y-2 p-4",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs font-medium">
            {isUser ? "You" : "Assistant"}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(message.createdAt).toLocaleTimeString()}
          </span>
        </div>

        <div className="prose prose-sm max-w-none dark:prose-invert">
          {message.content.split('\n').map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>

        {message.tags && message.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {message.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag.replace(/_/g, ' ')}
              </Badge>
            ))}
          </div>
        )}

        {message.confidence !== undefined && !isUser && (
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs">
              <span>Confidence</span>
              <span>{Math.round(message.confidence * 100)}%</span>
            </div>
            <div className="relative w-full">
              <Progress
                value={message.confidence * 100}
                className={cn(
                  "h-1.5",
                  message.confidence > 0.9 
                    ? "bg-green-100" 
                    : message.confidence > 0.7 
                    ? "bg-amber-100" 
                    : "bg-red-100"
                )}
              />
              <div 
                className={cn(
                  "absolute top-0 left-0 h-1.5 rounded-full",
                  message.confidence > 0.9
                    ? "bg-green-500"
                    : message.confidence > 0.7
                    ? "bg-amber-500"
                    : "bg-red-500"
                )}
                style={{ width: `${message.confidence * 100}%` }}
              />
            </div>
          </div>
        )}

        {message.citations && message.citations.length > 0 && !isUser && (
          <div className="border-t pt-2 text-xs text-muted-foreground">
            <span className="font-medium">Sources:</span>
            <ul className="mt-1 space-y-1">
              {message.citations.map((citation: Citation) => (
                <li key={citation.id} className="flex items-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info size={12} className="mr-1 inline" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs text-xs">{citation.text}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {citation.source}
                  {citation.url && (
                    <a
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 inline-flex items-center text-blue-500 hover:underline"
                    >
                      <ExternalLink size={10} className="ml-1" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {!isUser && (
        <div className="absolute right-6 top-0 flex -translate-y-1/2 items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant={feedback === "positive" ? "default" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={() => handleFeedback("positive")}
          >
            <ThumbsUp size={14} />
          </Button>
          <Button
            variant={feedback === "negative" ? "destructive" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={() => handleFeedback("negative")}
          >
            <ThumbsDown size={14} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleCopy}
          >
            <Copy size={14} />
          </Button>
        </div>
      )}
    </div>
  );
}