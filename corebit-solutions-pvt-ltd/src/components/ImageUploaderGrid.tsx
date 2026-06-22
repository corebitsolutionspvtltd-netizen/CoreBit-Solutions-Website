import React, { useState, useRef } from "react";
import { Upload, Trash2, Link, Image as ImageIcon, Plus, X, AlertTriangle } from "lucide-react";
import { normalizeImageUrl } from "../utils/imageUtils";

interface ImageUploaderGridProps {
  images: string[];
  onChange: (newImages: string[]) => void;
  label?: string;
  maxCount?: number;
}

export default function ImageUploaderGrid({
  images,
  onChange,
  label = "Showcase Screenshots",
  maxCount = 10,
}: ImageUploaderGridProps) {
  const [dragActive, setDragActive] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState("");
  const [errorText, setErrorText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Process selected or dropped file
  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorText("Please upload valid image files (PNG, JPG, WEBP, etc.)");
      return;
    }
    setErrorText("");

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDimension = 500; // Keep Firestore & LocalStorage quota foot-print optimized

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.55); // compressed highly-optimized JPEG (lightweight footprint)
          
          if (images.length >= maxCount) {
            setErrorText(`You can upload at most ${maxCount} screenshots.`);
            return;
          }
          
          onChange([...images, dataUrl]);
        }
      };
      img.onerror = () => {
        setErrorText("Failed to parse uploaded image file.");
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => processFile(file));
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Drag and Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setErrorText("");

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach((file: File) => processFile(file));
    }
  };

  // Link upload
  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = urlValue.trim();
    if (!cleanUrl) return;

    if (images.length >= maxCount) {
      setErrorText(`You can upload at most ${maxCount} screenshots.`);
      return;
    }

    onChange([...images, normalizeImageUrl(cleanUrl)]);
    setUrlValue("");
    setShowUrlInput(false);
    setErrorText("");
  };

  const removeImage = (indexToRemove: number) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
    setErrorText("");
  };

  return (
    <div className="space-y-3 font-sans">
      <div className="flex items-center justify-between">
        <label className="block text-[10px] sm:text-xs uppercase font-bold text-slate-400 tracking-wider font-mono">
          {label} <span className="text-slate-500">({images.length}/{maxCount})</span>
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="flex items-center gap-1.5 text-[9px] uppercase font-bold tracking-wider text-slate-400 hover:text-white bg-white/5 border border-white/5 px-2.5 py-1.5 rounded-xl transition-all"
        >
          <Link className="w-3 h-3" />
          {showUrlInput ? "Hide Add Link Option" : "Add via Web Link"}
        </button>
      </div>

      {/* Optional url paste drawer */}
      {showUrlInput && (
        <form onSubmit={handleAddUrl} className="flex gap-2 p-3 bg-slate-900/60 border border-white/5 rounded-xl animate-fade-in">
          <input
            type="url"
            placeholder="Paste raw image URL address (e.g. https://.../image.jpg)"
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none transition-all"
          />
          <button
            type="submit"
            className="px-4 py-1.5 bg-orange-500 hover:bg-orange-400 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            Add Link
          </button>
        </form>
      )}

      {/* Error Output */}
      {errorText && (
        <div className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-[10px] text-red-400">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{errorText}</span>
        </div>
      )}

      {/* Main Drag Drop Sandbox & Showcase Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        
        {/* Upload box */}
        {images.length < maxCount && (
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative aspect-[16/10] border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-3 text-center cursor-pointer select-none transition-all ${
              dragActive 
                ? "border-orange-500 bg-orange-500/5 text-orange-400 scale-[0.98]" 
                : "border-white/10 bg-slate-900/40 hover:border-white/20 hover:bg-slate-900/80 text-slate-400"
            }`}
          >
            <Upload className={`w-5 h-5 mb-1.5 transition-transform ${dragActive ? "animate-bounce" : "group-hover:scale-110"}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">
              {dragActive ? "Drop files here!" : "Upload Desktop Screenshot"}
            </span>
            <span className="text-[8px] text-slate-500 tracking-wide mt-1">
              Drag & Drop file or Click
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}

        {/* Existing screenshot list items */}
        {images.map((screen, idx) => {
          const isBase64 = screen.startsWith("data:");
          return (
            <div 
              key={idx} 
              className="relative aspect-[16/10] bg-slate-950 border border-white/10 rounded-xl overflow-hidden group select-none hover:border-slate-800 transition-colors"
            >
              <img
                src={normalizeImageUrl(screen)}
                alt={`Screenshot staging ${idx + 1}`}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              
              {/* Type Badge: Local vs Web */}
              <div className="absolute top-2 left-2 bg-slate-950/80 border border-white/5 px-1.5 py-0.5 rounded text-[7px] font-mono font-bold text-slate-400 tracking-wider uppercase">
                {isBase64 ? "Direct WebP/JPG" : "Link"}
              </div>

              {/* Index Badge */}
              <div className="absolute bottom-2 left-2 bg-slate-950/80 border border-white/5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-mono font-bold text-slate-400">
                {idx + 1}
              </div>

              {/* Remove Trigger Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(idx);
                  }}
                  className="p-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-transform hover:scale-110 shadow-lg cursor-pointer"
                  title="Remove Screenshot"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
