"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileIcon, Upload, X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onUploadComplete: (fileName: string, fileType: string, fileSize: number) => void;
  onCancel: () => void;
}

export function FileUpload({ onUploadComplete, onCancel }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const allowedFileTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "text/html",
    "application/json",
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (allowedFileTypes.includes(selectedFile.type) || selectedFile.name.endsWith(".docx") || selectedFile.name.endsWith(".pptx")) {
        setFile(selectedFile);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF, DOCX, PPT, TXT, HTML, or JSON file.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (allowedFileTypes.includes(droppedFile.type) || droppedFile.name.endsWith(".docx") || droppedFile.name.endsWith(".pptx")) {
        setFile(droppedFile);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF, DOCX, PPT, TXT, HTML, or JSON file.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const simulateUpload = () => {
    if (!file) return;
    
    setUploading(true);
    setProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 5;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setUploadComplete(true);
            setUploading(false);
            
            // Determine file type
            let fileType = "unknown";
            if (file.type.includes("pdf")) fileType = "pdf";
            else if (file.type.includes("word") || file.name.endsWith(".docx")) fileType = "docx";
            else if (file.type.includes("presentation") || file.name.endsWith(".pptx")) fileType = "ppt";
            else if (file.type.includes("plain")) fileType = "txt";
            else if (file.type.includes("html")) fileType = "html";
            else if (file.type.includes("json")) fileType = "json";
            
            onUploadComplete(file.name, fileType, file.size);
          }, 500);
        }
        return newProgress;
      });
    }, 50);
    
    return () => clearInterval(interval);
  };

  return (
    <div className="w-full">
      <div
        className="relative flex flex-col items-center justify-center border-2 border-dashed border-primary/20 rounded-lg p-6 transition-colors hover:border-primary/50"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {!file ? (
          <>
            <div className="flex flex-col items-center justify-center space-y-2 text-center">
              <div className="rounded-full bg-primary/10 p-3">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Drag & drop your quote file</p>
                <p className="text-xs text-muted-foreground">
                  PDF, DOCX, PPT, TXT, HTML, or JSON files up to 10MB
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => fileInputRef.current?.click()}
              >
                Browse files
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.ppt,.pptx,.txt,.html,.json"
              className="hidden"
              onChange={handleFileChange}
            />
          </>
        ) : (
          <div className="w-full space-y-4">
            <div className="flex items-center space-x-2">
              <div className="rounded-full bg-primary/10 p-2">
                <FileIcon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
              {uploadComplete ? (
                <div className="rounded-full bg-green-100 p-1 dark:bg-green-900">
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {uploading && (
              <div className="space-y-1">
                <Progress value={progress} className="h-1" />
                <p className="text-xs text-right text-muted-foreground">
                  {progress}%
                </p>
              </div>
            )}
            
            {!uploading && !uploadComplete && (
              <div className="flex space-x-2">
                <Button className="flex-1" size="sm" onClick={simulateUpload}>
                  Upload
                </Button>
                <Button variant="outline" size="sm" onClick={onCancel}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}