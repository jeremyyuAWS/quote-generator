import { UploadedFile } from "./file";

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
  confidence?: number;
  citations?: Citation[];
  feedback?: "positive" | "negative" | null;
  tags?: string[];
}

export interface Citation {
  id: string;
  text: string;
  url?: string;
  source: string;
}

export interface Chat {
  id: string;
  title: string;
  createdAt: string;
  messages: Message[];
  files: string[]; // File IDs
}