export type FileType = "pdf" | "docx" | "txt" | "json" | "html" | "ppt" | "unknown";

export interface UploadedFile {
  id: string;
  name: string;
  type: FileType;
  size: number;
  createdAt: string;
  url?: string;
  metadata?: {
    pageCount?: number;
    wordCount?: number;
    author?: string;
    createdAt?: string;
    [key: string]: any;
  };
}