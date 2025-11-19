/* eslint-disable @next/next/no-img-element */
"use client";

import { X, ExternalLink } from "lucide-react";

type ImageViewerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt?: string;
};

export function ImageViewerModal({
  isOpen,
  onClose,
  imageUrl,
  alt = "Imagem da sugestão de melhoria",
}: ImageViewerModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-7xl max-h-[90vh] w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent p-4">
          <h3 className="text-sm font-medium text-white">
            {alt}
          </h3>
          <div className="flex items-center gap-2">
            <a
              href={imageUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-lg bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-700/80"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="size-3" />
              Abrir em nova aba
            </a>
            <button
              onClick={onClose}
              className="rounded-lg bg-slate-800/80 p-2 text-white transition hover:bg-slate-700/80"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="flex items-center justify-center min-h-[50vh] max-h-[90vh] bg-black/50 rounded-lg overflow-hidden p-4">
          <img
            src={imageUrl}
            alt={alt}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    </div>
  );
}

