import { Loader2, Save, X } from "lucide-react";
import { DAYS_OF_WEEK } from "../constants";

interface ExamFormData {
  id: string;
  label: string;
  availableDays: string[];
  morningLimit: number;
  afternoonLimit: number;
}

interface ExamFormProps {
  formData: ExamFormData;
  setFormData: (data: ExamFormData) => void;
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
  toggleDay: (day: string) => void;
  isEdit?: boolean;
}

export function ExamForm({
  formData,
  setFormData,
  onSave,
  onCancel,
  isLoading,
  toggleDay,
  isEdit = false,
}: ExamFormProps) {
  return (
    <div className="space-y-4 rounded-lg border border-slate-700 bg-slate-800/50 p-4">
      {!isEdit && (
        <div>
          <label className="mb-1 block text-sm text-slate-300">ID *</label>
          <input
            type="text"
            value={formData.id}
            onChange={(e) => {
              // Converter espaços em traços e manter apenas letras minúsculas, números, traços e underscores
              const formatted = e.target.value
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9_-]/g, "");
              setFormData({ ...formData, id: formatted });
            }}
            placeholder="Ex: exame-sangue"
            className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-slate-200 placeholder-slate-500"
          />
        </div>
      )}
      <div>
        <label className="mb-1 block text-sm text-slate-300">Nome *</label>
        <input
          type="text"
          value={formData.label}
          onChange={(e) =>
            setFormData({ ...formData, label: e.target.value })
          }
          placeholder="Ex: Exame de Sangue"
          className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-slate-200 placeholder-slate-500"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-300">Dias Disponíveis *</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {DAYS_OF_WEEK.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                formData.availableDays.includes(day)
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-700 text-slate-400 hover:bg-slate-600"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm text-slate-300">
            Limite Manhã
          </label>
          <input
            type="number"
            min="0"
            value={formData.morningLimit}
            onChange={(e) =>
              setFormData({
                ...formData,
                morningLimit: parseInt(e.target.value) || 0,
              })
            }
            className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-slate-200"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-300">
            Limite Tarde
          </label>
          <input
            type="number"
            min="0"
            value={formData.afternoonLimit}
            onChange={(e) =>
              setFormData({
                ...formData,
                afternoonLimit: parseInt(e.target.value) || 0,
              })
            }
            className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-slate-200"
          />
        </div>
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

