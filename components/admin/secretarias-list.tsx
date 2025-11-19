"use client";

import { useState } from "react";
import { Pencil, Trash2, Users, Plus } from "lucide-react";
import { Secretaria, useDeleteSecretaria } from "@/hooks/use-secretarias";
import { toast } from "react-hot-toast";

type SecretariasListProps = {
  secretarias: Secretaria[];
  reportTypes: Array<{ id: string; label: string; secretaria: string | null }>;
  onEdit: (secretaria: Secretaria) => void;
  onCreateAdmin: (secretaria: Secretaria) => void;
  cityId: string;
};

export function SecretariasList({
  secretarias,
  reportTypes,
  onEdit,
  onCreateAdmin,
  cityId,
}: SecretariasListProps) {
  const deleteMutation = useDeleteSecretaria();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (secretaria: Secretaria) => {
    if (
      !confirm(
        `Tem certeza que deseja deletar a secretaria "${secretaria.label}"?`
      )
    ) {
      return;
    }

    setDeletingId(secretaria.id);
    try {
      await deleteMutation.mutateAsync({
        cityId,
        secretariaId: secretaria.id,
      });
    } catch (error) {
      // Erro já é tratado no hook
    } finally {
      setDeletingId(null);
    }
  };

  const getReportTypeLabels = (reportTypeIds: string[]) => {
    return reportTypeIds
      .map((id) => reportTypes.find((rt) => rt.id === id)?.label)
      .filter(Boolean)
      .join(", ");
  };

  if (secretarias.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 text-center">
        <p className="text-slate-400">Nenhuma secretaria cadastrada.</p>
        <p className="mt-2 text-sm text-slate-500">
          Clique em "Adicionar Secretaria" para criar a primeira.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {secretarias.map((secretaria) => (
        <div
          key={secretaria.id}
          className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-semibold text-white truncate">
                  {secretaria.label}
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-300 shrink-0">
                  Secretaria
                </span>
              </div>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Users className="size-4" />
                  <span>{secretaria.adminCount} administrador(es)</span>
                </div>
                {secretaria.reportTypes.length > 0 ? (
                  <div className="text-sm text-slate-300">
                    <span className="text-slate-400">Tipos de sugestão de melhoria: </span>
                    {getReportTypeLabels(secretaria.reportTypes)}
                  </div>
                ) : (
                  <div className="text-sm text-amber-400">
                    Nenhum tipo de sugestão de melhoria associado
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onCreateAdmin(secretaria)}
                className="inline-flex items-center gap-1 sm:gap-2 rounded-xl border border-emerald-500/50 bg-emerald-500/10 px-2 sm:px-3 py-2 text-xs font-medium text-emerald-300 transition hover:border-emerald-400 hover:bg-emerald-500/20"
              >
                <Plus className="size-3" />
                <span className="hidden sm:inline">Criar Admin</span>
                <span className="sm:hidden">Admin</span>
              </button>
              <button
                onClick={() => onEdit(secretaria)}
                className="inline-flex items-center gap-1 sm:gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-2 sm:px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800"
              >
                <Pencil className="size-3" />
                Editar
              </button>
              <button
                onClick={() => handleDelete(secretaria)}
                disabled={deletingId === secretaria.id}
                className="inline-flex items-center gap-1 sm:gap-2 rounded-xl border border-red-500/50 bg-red-500/10 px-2 sm:px-3 py-2 text-xs font-medium text-red-300 transition hover:border-red-400 hover:bg-red-500/20 disabled:opacity-50"
              >
                <Trash2 className="size-3" />
                {deletingId === secretaria.id ? "Deletando..." : "Deletar"}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

