"use client";

import { useState, useEffect, useMemo } from "react";
import { X, Check, Search } from "lucide-react";
import {
  Secretaria,
  useUpdateSecretaria,
  useReportTypes,
} from "@/hooks/use-secretarias";

type EditSecretariaFormProps = {
  secretaria: Secretaria;
  cityId: string;
  onSuccess: () => void;
  onCancel: () => void;
};

export function EditSecretariaForm({
  secretaria,
  cityId,
  onSuccess,
  onCancel,
}: EditSecretariaFormProps) {
  const [label, setLabel] = useState(secretaria.label);
  const [selectedReportTypes, setSelectedReportTypes] = useState<string[]>(
    secretaria.reportTypes || []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const updateMutation = useUpdateSecretaria();
  const { data: reportTypesData } = useReportTypes(cityId);

  useEffect(() => {
    setLabel(secretaria.label);
    setSelectedReportTypes(secretaria.reportTypes || []);
  }, [secretaria]);

  const availableReportTypes = useMemo(() => {
    const allTypes = reportTypesData?.reportTypes || [];
    const sorted = [...allTypes].sort((a, b) => 
      a.label.localeCompare(b.label, "pt-BR", { sensitivity: "base" })
    );
    
    if (!searchQuery.trim()) {
      return sorted;
    }
    
    const query = searchQuery.toLowerCase().trim();
    return sorted.filter((rt) =>
      rt.label.toLowerCase().includes(query) ||
      rt.id.toLowerCase().includes(query)
    );
  }, [reportTypesData?.reportTypes, searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!label.trim()) {
      return;
    }

    try {
      await updateMutation.mutateAsync({
        cityId,
        secretariaId: secretaria.id,
        payload: {
          label: label.trim(),
          reportTypes: selectedReportTypes,
        },
      });
      onSuccess();
    } catch (error) {
      // Erro já é tratado no hook
    }
  };

  const toggleReportType = (reportTypeId: string) => {
    setSelectedReportTypes((prev) =>
      prev.includes(reportTypeId)
        ? prev.filter((id) => id !== reportTypeId)
        : [...prev, reportTypeId]
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          Editar Secretaria
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg p-1 text-slate-400 hover:text-white"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            ID da Secretaria
          </label>
          <input
            type="text"
            value={secretaria.id}
            disabled
            className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2 text-sm text-slate-400"
          />
          <p className="mt-1 text-xs text-slate-500">
            O ID não pode ser alterado
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Nome da Secretaria *
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="ex: Secretaria de Obras"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
            required
          />
        </div>

        {availableReportTypes.length > 0 && (
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Tipos de Irregularidade
            </label>
            <div className="mb-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar tipos de irregularidade..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
              />
            </div>
            {availableReportTypes.length > 0 ? (
              <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-slate-700 bg-slate-950 p-3">
                {availableReportTypes.map((rt) => {
                const isSelected = selectedReportTypes.includes(rt.id);
                const isAssignedToOther =
                  Boolean(rt.secretaria) && rt.secretaria !== secretaria.id;

                return (
                  <label
                    key={rt.id}
                    className={`flex items-center gap-2 rounded-lg p-2 ${
                      isAssignedToOther
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-slate-800"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleReportType(rt.id)}
                      disabled={isAssignedToOther}
                      className="size-4 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-400 disabled:cursor-not-allowed"
                    />
                    <span className="text-sm text-slate-300">
                      {rt.label}
                      {isAssignedToOther && (
                        <span className="ml-2 text-xs text-amber-400">
                          (já atribuído)
                        </span>
                      )}
                    </span>
                  </label>
                );
              })}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-700 bg-slate-950 p-4 text-center text-sm text-slate-400">
                Nenhum tipo encontrado para "{searchQuery}"
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-emerald-950 transition hover:bg-emerald-400 disabled:opacity-50"
          >
            <Check className="size-4" />
            {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-700"
          >
            Cancelar
          </button>
        </div>
      </div>
    </form>
  );
}

