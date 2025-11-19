/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Image } from "lucide-react";
import { ImageViewerModal } from "./image-viewer-modal";

type ImagePreviewProps = {
  imageUrl: string | null;
  alt?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "h-16 w-16",
  md: "h-24 w-24",
  lg: "h-32 w-32",
};

export function ImagePreview({
  imageUrl,
  alt = "Imagem da sugestão de melhoria",
  className = "",
  size = "md",
}: ImagePreviewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!imageUrl) {
    return (
      <div
        className={`${sizeClasses[size]} ${className} flex items-center justify-center rounded-lg border border-slate-800 bg-slate-900/50 text-slate-600`}
      >
        <Image className="size-6" />
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`${sizeClasses[size]} ${className} group relative overflow-hidden rounded-lg border border-slate-800 bg-slate-900/50 transition hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20`}
      >
        <img
          src={imageUrl}
          alt={alt}
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
          <span className="rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white">
            Ver imagem
          </span>
        </div>
      </button>

      <ImageViewerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imageUrl={imageUrl}
        alt={alt}
      />
    </>
  );
}


