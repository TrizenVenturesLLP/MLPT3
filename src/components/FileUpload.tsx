
import React, { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, File, X, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, disabled = false }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file: File): boolean => {
    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0] && !disabled) {
      const uploadedFile = e.dataTransfer.files[0];
      if (validateFile(uploadedFile)) {
        setFile(uploadedFile);
        onFileUpload(uploadedFile);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0] && !disabled) {
      const uploadedFile = e.target.files[0];
      if (validateFile(uploadedFile)) {
        setFile(uploadedFile);
        onFileUpload(uploadedFile);
      }
    }
  };

  const handleButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div 
        className={cn(
          "relative h-64 flex flex-col items-center justify-center p-8 mt-4 rounded-xl transition-all duration-300 ease-in-out gradient-border",
          "bg-white/40 dark:bg-slate-900/40 backdrop-blur-md",
          dragActive ? "scale-[1.02] shadow-glow" : "",
          disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:shadow-glow",
          file ? "bg-primary/5" : ""
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!disabled ? handleButtonClick : undefined}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
        />
        
        <div className="flex flex-col items-center text-center transition-all duration-300 ease-in-out gap-2">
          {file ? (
            <>
              <div className="w-16 h-16 mb-2 rounded-full bg-primary/10 flex items-center justify-center glow">
                <Check className="w-6 h-6 text-primary" />
              </div>
              <p className="font-medium text-xl text-foreground animate-fade-in">
                {file.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB
              </p>
              {!disabled && (
                <button 
                  onClick={clearFile}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-secondary/80 hover:bg-secondary flex items-center justify-center transition-all backdrop-blur-sm"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </>
          ) : (
            <>
              <div className="mb-5 w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-float glow">
                <UploadCloud className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-medium text-foreground">
                {dragActive ? "Drop your CSV file here" : "Upload your CSV file"}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-xs">
                Drag and drop or click to upload your dataset
              </p>
              <div className="mt-6 px-3 py-1.5 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm flex gap-2 items-center text-xs text-primary">
                <Sparkles className="w-3 h-3" />
                <span>CSV files only</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
