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
  const [label, setLabel] = useState(existingItem?.label || "Cidade Inteligente");
  const [bgColor, setBgColor] = useState(existingItem?.bgColor || "#8B5CF6");
  const [iconName, setIconName] = useState(existingItem?.iconName || "map");
  const [description, setDescription] = useState(
    existingItem?.description || "Mapa interativo com pontos de interesse"
  );

  const iconOptions = [
    { value: "map", label: "Map" },
    { value: "location", label: "Location" },
    { value: "navigate", label: "Navigate" },
    { value: "compass", label: "Compass" },
    { value: "pin", label: "Pin" },
    { value: "map-pin", label: "Map Pin" },
    { value: "globe", label: "Globe" },
    { value: "earth", label: "Earth" },
    { value: "layers", label: "Layers" },
    { value: "grid", label: "Grid" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) {
      toast.error("O label é obrigatório");
      return;
    }
    if (!bgColor || !bgColor.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
      toast.error("Cor inválida. Use formato hexadecimal (ex: #8B5CF6)");
      return;
    }
    onSave({
      label: label.trim(),
      bgColor,
      iconName,
      description: description.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg border border-slate-800 bg-slate-900 shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-200">
            {existingItem ? "Editar Item do Menu" : "Configurar Item do Menu"}
          </h3>
          <button
            onClick={onCancel}
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
          >
            <X className="size-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              ID (fixo)
            </label>
            <input
              type="text"
              value="smartCity"
              disabled
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 text-slate-400 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-slate-500">
              O ID "smartCity" é fixo e não pode ser alterado
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Label <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ex: Cidade Inteligente"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Cor de Fundo <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-20 h-10 rounded-lg border border-slate-700 cursor-pointer"
              />
              <input
                type="text"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                placeholder="#8B5CF6"
                pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Ícone <span className="text-red-400">*</span>
            </label>
            <select
              value={iconName}
              onChange={(e) => setIconName(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
            >
              {iconOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Descrição (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Mapa interativo com pontos de interesse"
              rows={3}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-200 placeholder-slate-500 resize-none focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-slate-700 bg-slate-800 px-6 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
            >
              <Save className="size-4" />
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


