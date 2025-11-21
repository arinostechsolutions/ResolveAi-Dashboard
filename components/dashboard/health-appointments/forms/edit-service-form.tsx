import { Loader2, Save, X } from "lucide-react";
import type { HealthService } from "@/hooks/use-health-appointments";

interface EditServiceFormProps {
  service: HealthService;
  formData: { id: string; name: string; address: string };
  setFormData: (data: { id: string; name: string; address: string }) => void;
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function EditServiceForm({
  formData,
  setFormData,
  onSave,
  onCancel,
  isLoading,
}: EditServiceFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm text-slate-300">Nome</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
          className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-slate-200"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-300">Endereço</label>
        <input
          type="text"
          value={formData.address}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
          className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-slate-200"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={onSave}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Salvar
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-600"
        >
          <X className="size-4" />
          Cancelar
        </button>
      </div>
    </div>
  );
}

