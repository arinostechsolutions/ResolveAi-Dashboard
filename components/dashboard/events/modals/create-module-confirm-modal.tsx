import { AlertCircle } from "lucide-react";

interface CreateModuleConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function CreateModuleConfirmModal({
  onConfirm,
  onCancel,
}: CreateModuleConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="rounded-lg border border-slate-700 bg-slate-800 p-6 max-w-md w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-full bg-blue-500/10 p-2">
            <AlertCircle className="size-5 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-200">
            Criar Módulo de Eventos
          </h3>
        </div>
        <p className="text-slate-300 mb-4">
          Você está prestes a criar a estrutura do módulo de eventos no menu do aplicativo mobile.
        </p>
        <p className="text-slate-400 text-sm mb-6">
          <strong className="text-amber-400">Importante:</strong> Ao criar o módulo, ele ainda não será habilitado para os usuários. 
          Você precisará configurar o item do menu e, após cadastrar eventos, poderá habilitar o módulo através da toggle em "Gerenciar Eventos".
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
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}




