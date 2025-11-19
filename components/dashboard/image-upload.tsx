"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import apiClient from "@/lib/api-client";

type ImageUploadProps = {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
};

export function ImageUpload({
  images,
  onImagesChange,
  maxImages = 8,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      toast.error(`Você já adicionou o máximo de ${maxImages} imagens.`);
      return;
    }

    const filesArray = Array.from(files).slice(0, remainingSlots);
    
    // Validar tipos de arquivo
    const validFiles = filesArray.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} não é uma imagem válida.`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} é muito grande (máximo 10MB).`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);

    try {
      const formData = new FormData();
      validFiles.forEach((file) => {
        formData.append("images", file);
      });

      const response = await apiClient.post("/api/upload/images", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const newUrls = response.data.images.map((img: any) => img.url);
      onImagesChange([...images, ...newUrls]);
      toast.success(`${validFiles.length} imagem(ns) enviada(s) com sucesso!`);
    } catch (error: any) {
      console.error("Erro ao fazer upload:", error);
      toast.error(
        error?.response?.data?.message || "Erro ao fazer upload das imagens."
      );
    } finally {
      setUploading(false);
    }
  };

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
    handleFileSelect(e.dataTransfer.files);
  };

  const handleRemoveImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  const handleAddUrl = () => {
    const url = prompt("Cole a URL da imagem:");
    if (url && url.trim() && !images.includes(url.trim())) {
      if (images.length >= maxImages) {
        toast.error(`Você já adicionou o máximo de ${maxImages} imagens.`);
        return;
      }
      onImagesChange([...images, url.trim()]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Área de Upload */}
      {images.length < maxImages && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            relative rounded-lg border-2 border-dashed p-6 transition-colors
            ${
              dragActive
                ? "border-emerald-500 bg-emerald-500/10"
                : "border-slate-700 bg-slate-800/50"
            }
            ${uploading ? "opacity-50 pointer-events-none" : ""}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center text-center">
            {uploading ? (
              <>
                <Loader2 className="mb-2 size-8 animate-spin text-emerald-400" />
                <p className="text-sm text-slate-400">Enviando imagens...</p>
              </>
            ) : (
              <>
                <Upload className="mb-2 size-8 text-slate-400" />
                <p className="mb-1 text-sm font-medium text-slate-300">
                  Arraste imagens aqui ou clique para selecionar
                </p>
                <p className="mb-3 text-xs text-slate-500">
                  Máximo {maxImages} imagens (10MB cada)
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg border border-emerald-500 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20"
                  >
                    Selecionar Arquivos
                  </button>
                  <button
                    type="button"
                    onClick={handleAddUrl}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700"
                  >
                    Adicionar URL
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Preview das Imagens */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((url, index) => (
            <div key={index} className="group relative">
              <div className="relative aspect-square overflow-hidden rounded-lg border border-slate-700 bg-slate-800">
                <img
                  src={url}
                  alt={`Imagem ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute right-1 top-1 rounded-full bg-red-500/80 p-1.5 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="size-3 text-white" />
                </button>
                <div className="absolute bottom-1 left-1 rounded bg-slate-900/80 px-2 py-0.5 text-xs text-slate-200">
                  {index + 1}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-700 bg-slate-800/50 p-8 text-center">
          <ImageIcon className="mx-auto mb-2 size-8 text-slate-500" />
          <p className="text-sm text-slate-400">Nenhuma imagem adicionada</p>
        </div>
      )}
    </div>
  );
}

