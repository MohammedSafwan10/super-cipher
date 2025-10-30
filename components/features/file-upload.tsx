"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, File, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileRead: (content: string, filename: string) => void;
}

export function FileUpload({ onFileRead }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileRead(content, file.name);
    };
    reader.readAsText(file);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && file.type === "text/plain") {
        setSelectedFile(file);
        readFile(file);
      } else {
        alert("Please upload a text file (.txt)");
      }
    },
    []
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      readFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass dark:glass-dark rounded-2xl p-6 shadow-xl"
    >
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Upload className="w-5 h-5 text-blue-500" />
        Upload File
      </h3>

      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer hover:border-blue-500/50",
            isDragging
              ? "border-blue-500 bg-blue-500/10"
              : "border-white/20 dark:border-white/10"
          )}
        >
          <input
            type="file"
            accept=".txt"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-semibold mb-2">Drop your file here</p>
            <p className="text-sm opacity-70">or click to browse</p>
            <p className="text-xs opacity-50 mt-2">Only .txt files are supported</p>
          </label>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30"
        >
          <File className="w-8 h-8 text-blue-500" />
          <div className="flex-1">
            <p className="font-semibold">{selectedFile.name}</p>
            <p className="text-sm opacity-70">
              {(selectedFile.size / 1024).toFixed(2)} KB
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={removeFile}
            className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-500 transition-all"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}
