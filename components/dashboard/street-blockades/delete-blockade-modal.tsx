"use client";

import { X, AlertTriangle, Trash2 } from "lucide-react";
import { StreetBlockade } from "@/hooks/use-street-blockades";

interface DeleteBlockadeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  blockade: StreetBlockade | null;
  isDeleting: boolean;
}

export function DeleteBlockadeModal({
  isOpen,
  onClose,
  onConfirm,
  blockade,
  isDeleting,
}: DeleteBlockadeModalProps) {
  if (!isOpen || !blockade) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-md rounded-lg border border-slate-800 bg-slate-900 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
              <AlertTriangle className="size-5 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-200">Confirmar Exclusão</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200 disabled:opacity-50"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-slate-300">
            Tem certeza que deseja excluir esta interdição de rua?
          </p>

          {/* Informações da interdição */}
          <div className="rounded-lg border border-slate-800 bg-slate-800/50 p-4 space-y-2">
            <div>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Rua</span>
              <p className="text-sm font-medium text-slate-200 mt-1">
                {blockade.route.streetName}
              </p>
            </div>
            <div>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Bairro</span>
              <p className="text-sm text-slate-300 mt-1">
                {blockade.route.neighborhood}
              </p>
            </div>
            <div>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Motivo</span>
              <p className="text-sm text-slate-300 mt-1">
                {blockade.reason}
              </p>
            </div>
          </div>

          {/* Aviso importante */}
          <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-5 text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-300">
                  Atenção
                </p>
                <p className="text-sm text-amber-200/80">
                  Esta interdição será removida permanentemente e não estará mais visível no aplicativo mobile para a população.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 justify-end border-t border-slate-800 bg-slate-900 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-lg border border-slate-700 bg-slate-800 px-6 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-2 rounded-lg bg-red-500 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="size-4" />
            {isDeleting ? "Excluindo..." : "Excluir Interdição"}
          </button>
        </div>
      </div>
    </div>
  );
}


