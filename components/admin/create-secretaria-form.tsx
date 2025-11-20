"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import { useCreateSecretaria } from "@/hooks/use-secretarias";

type CreateSecretariaFormProps = {
  cityId: string;
  onSuccess: () => void;
  onCancel: () => void;
};

export function CreateSecretariaForm({
  cityId,
  onSuccess,
  onCancel,
}: CreateSecretariaFormProps) {
  const [id, setId] = useState("");
  const [label, setLabel] = useState("");
  const createMutation = useCreateSecretaria();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id.trim() || !label.trim()) {
      return;
    }

    // Validar formato do ID (slug)
    const idRegex = /^[a-z0-9_]+$/;
    if (!idRegex.test(id)) {
      alert(
        "ID deve conter apenas letras minúsculas, números e underscore."
      );
      return;
    }

    try {
      await createMutation.mutateAsync({
        cityId,
        payload: {
          id: id.trim(),
          label: label.trim(),
        },
      });
      setId("");
      setLabel("");
      onSuccess();
    } catch (error) {
      // Erro já é tratado no hook
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          Adicionar Secretaria
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
            ID da Secretaria *
          </label>
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value.toLowerCase())}
            placeholder="ex: obras, meio_ambiente"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
            required
          />
          <p className="mt-1 text-xs text-slate-500">
            Apenas letras minúsculas, números e underscore
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
          <p className="mt-2 text-xs text-slate-500">
            A associação de tipos de sugestão de melhoria é feita na aba "Configuração Mobile".
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-emerald-950 transition hover:bg-emerald-400 disabled:opacity-50"
          >
            <Check className="size-4" />
            {createMutation.isPending ? "Criando..." : "Criar Secretaria"}
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

