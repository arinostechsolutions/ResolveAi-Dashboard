import { useState } from "react";
import { Save, X } from "lucide-react";
import { toast } from "react-hot-toast";
import type { MenuItem } from "@/hooks/use-city-menu";

interface MenuFormModalProps {
  existingItem?: MenuItem;
  onSave: (item: Omit<MenuItem, "id">) => void;
  onCancel: () => void;
}

export function MenuFormModal({
  existingItem,
  onSave,
  onCancel,
}: MenuFormModalProps) {
  const [label, setLabel] = useState(existingItem?.label || "Agendamento de Saúde");
  const [bgColor, setBgColor] = useState(existingItem?.bgColor || "#4CAF50");
  const [iconName, setIconName] = useState(existingItem?.iconName || "medical");
  const [description, setDescription] = useState(existingItem?.description || "Agende consultas e exames médicos");

  const iconOptions = [
    { value: "medical", label: "Medical" },
    { value: "fitness", label: "Fitness" },
    { value: "heart", label: "Heart" },
    { value: "pulse", label: "Pulse" },
    { value: "bandage", label: "Bandage" },
    { value: "medkit", label: "Medkit" },
    { value: "accessibility", label: "Accessibility" },
    { value: "person", label: "Person" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) {
      toast.error("O label é obrigatório");
      return;
    }
    if (!bgColor || !bgColor.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
      toast.error("Cor inválida. Use formato hexadecimal (ex: #4CAF50)");
      return;
    }
    onSave({ 
      label: label.trim(), 
      bgColor, 
      iconName, 
      description: description.trim() || undefined 
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="rounded-lg border border-slate-700 bg-slate-800 p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-200">
            {existingItem ? "Editar Item do Menu" : "Configurar Item do Menu"}
          </h3>
          <button
            onClick={onCancel}
            className="rounded-lg p-1 text-slate-400 hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              ID (fixo)
            </label>
            <input
              type="text"
              value="health"
              disabled
              className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-slate-400 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-slate-500">
              O ID "health" é fixo e não pode ser alterado
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Label *
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ex: Agendamento de Saúde"
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-slate-200 placeholder-slate-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Cor de Fundo *
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-20 h-10 rounded-lg border border-slate-600 cursor-pointer"
              />
              <input
                type="text"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                placeholder="#4CAF50"
                pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                className="flex-1 rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-slate-200 placeholder-slate-500"
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Escolha a cor hexadecimal que será exibida no card do menu
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Ícone *
            </label>
            <select
              value={iconName}
              onChange={(e) => setIconName(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-slate-200"
            >
              {iconOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">
              Ícone que será exibido no card do menu (Ionicons)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Descrição (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Agende consultas e exames médicos"
              rows={3}
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-slate-200 placeholder-slate-500 resize-none"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
            >
              <Save className="inline-block size-4 mr-2" />
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

