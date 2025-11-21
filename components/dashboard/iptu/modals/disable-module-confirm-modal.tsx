import { AlertCircle } from "lucide-react";

interface DisableModuleConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function DisableModuleConfirmModal({
  onConfirm,
  onCancel,
}: DisableModuleConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="rounded-lg border border-slate-700 bg-slate-800 p-6 max-w-md w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-full bg-red-500/10 p-2">
            <AlertCircle className="size-5 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200">
            Desabilitar Módulo de IPTU
          </h3>
        </div>
        <p className="text-slate-300 mb-4">
          Ao confirmar, o módulo de IPTU será desabilitado e não aparecerá no aplicativo mobile para os usuários.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-600"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

