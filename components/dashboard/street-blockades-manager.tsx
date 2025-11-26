"use client";

import { useState } from "react";
import { useCity } from "@/context/city-context";
import {
  useStreetBlockadesList,
  useCreateBlockade,
  useUpdateBlockade,
  useUpdateBlockadeStatus,
  useDeleteBlockade,
  type BlockadeType,
  type BlockadeStatus,
  type StreetBlockade,
} from "@/hooks/use-street-blockades";
import { toast } from "react-hot-toast";
import { AlertCircle, Plus, Edit, Trash2, MapPin, Calendar, AlertTriangle, Loader2, ChevronLeft, ChevronRight, RefreshCcw, Search } from "lucide-react";
import { CreateBlockadeModal } from "./street-blockades/create-blockade-modal";
import { EditBlockadeModal } from "./street-blockades/edit-blockade-modal";
import { DeleteBlockadeModal } from "./street-blockades/delete-blockade-modal";
import { clsx } from "clsx";

const getTypeLabel = (type: BlockadeType): string => {
  const labels: Record<BlockadeType, string> = {
    evento: "Evento",
    obra: "Obra",
    emergencia: "Emergência",
    manutencao: "Manutenção",
    outro: "Outro",
  };
  return labels[type] || type;
};

const getStatusLabel = (status: BlockadeStatus): string => {
  const labels: Record<BlockadeStatus, string> = {
    agendado: "Agendado",
    ativo: "Ativo",
    encerrado: "Encerrado",
    cancelado: "Cancelado",
  };
  return labels[status] || status;
};

const getTypeColor = (type: BlockadeType): string => {
  const colors: Record<BlockadeType, string> = {
    evento: "bg-blue-500/10 text-blue-300 border-blue-500/50",
    obra: "bg-orange-500/10 text-orange-300 border-orange-500/50",
    emergencia: "bg-red-500/10 text-red-300 border-red-500/50",
    manutencao: "bg-emerald-500/10 text-emerald-300 border-emerald-500/50",
    outro: "bg-slate-500/10 text-slate-300 border-slate-500/50",
  };
  return colors[type] || "bg-slate-500/10 text-slate-300 border-slate-500/50";
};

const getStatusColor = (status: BlockadeStatus): string => {
  const colors: Record<BlockadeStatus, string> = {
    agendado: "bg-yellow-500/10 text-yellow-300 border-yellow-500/50",
    ativo: "bg-emerald-500/10 text-emerald-300 border-emerald-500/50",
    encerrado: "bg-slate-500/10 text-slate-300 border-slate-500/50",
    cancelado: "bg-red-500/10 text-red-300 border-red-500/50",
  };
  return colors[status] || "bg-slate-500/10 text-slate-300 border-slate-500/50";
};

export function StreetBlockadesManager() {
  const { cityId } = useCity();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBlockade, setEditingBlockade] = useState<StreetBlockade | null>(null);
  const [deletingBlockade, setDeletingBlockade] = useState<StreetBlockade | null>(null);
  
  const { data, isLoading } = useStreetBlockadesList({
    cityId: cityId || undefined,
    status: statusFilter,
    page,
    limit: 20,
  });

  const deleteBlockade = useDeleteBlockade();
  const updateStatus = useUpdateBlockadeStatus();

  // Filtrar resultados por busca (client-side)
  const filteredBlockades = data?.blockades.filter((blockade) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      blockade.route.streetName.toLowerCase().includes(search) ||
      blockade.route.neighborhood.toLowerCase().includes(search) ||
      blockade.reason.toLowerCase().includes(search) ||
      getTypeLabel(blockade.type).toLowerCase().includes(search)
    );
  }) || [];

  const handleDeleteClick = (blockade: StreetBlockade) => {
    setDeletingBlockade(blockade);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingBlockade) return;

    try {
      await deleteBlockade.mutateAsync(deletingBlockade._id);
      toast.success("Interdição excluída com sucesso!");
      setDeletingBlockade(null);
    } catch (error) {
      toast.error("Erro ao excluir interdição");
    }
  };

  const handleStatusChange = async (id: string, newStatus: BlockadeStatus) => {
    try {
      await updateStatus.mutateAsync({ id, status: newStatus });
      toast.success("Status atualizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar status");
    }
  };

  if (!cityId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400">Selecione uma cidade para gerenciar interdições</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col gap-6 pb-12">
      <header className="mb-2">
        <h1 className="text-2xl font-semibold text-white sm:text-3xl">
          Interdições de Ruas
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Gerencie interdições e bloqueios de ruas para eventos, obras, emergências e manutenções.
        </p>
      </header>

      {/* Filtros */}
      <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-3 shadow-lg shadow-slate-900/30 sm:p-4 lg:p-6">
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Filtrar por status
            </span>
            <select
              value={statusFilter || "all"}
              onChange={(e) => {
                setStatusFilter(e.target.value === "all" ? undefined : e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
            >
              <option value="all">Todos os status</option>
              <option value="agendado">Agendado</option>
              <option value="ativo">Ativo</option>
              <option value="encerrado">Encerrado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Buscar interdições
            </span>
            <div className="relative flex h-11 items-center rounded-xl border border-slate-800 bg-slate-950">
              <Search className="pointer-events-none ml-3 size-4 text-slate-500" />
              <input
                className="h-full w-full bg-transparent pl-3 pr-3 text-sm text-slate-100 outline-none placeholder:text-slate-500"
                placeholder="Digite rua, bairro ou motivo..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          <div className="flex items-end justify-end sm:col-span-2 lg:col-span-2">
            <button
              type="button"
              onClick={() => {
                setStatusFilter(undefined);
                setSearchTerm("");
                setPage(1);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-3 sm:px-4 py-2 text-xs sm:text-sm text-slate-200 transition hover:border-emerald-400 hover:text-emerald-200"
            >
              <RefreshCcw className="size-3 sm:size-4" />
              <span className="hidden sm:inline">Resetar filtros</span>
              <span className="sm:hidden">Resetar</span>
            </button>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="w-full sm:w-auto ml-2 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
            >
              <Plus className="size-3 sm:size-4" />
              <span className="hidden sm:inline">Nova Interdição</span>
              <span className="sm:hidden">Nova</span>
            </button>
          </div>
        </div>
      </section>

      {/* Lista de interdições */}
      <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg shadow-slate-900/30 sm:p-6">
        <header className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-white sm:text-lg">
              Interdições cadastradas
            </h2>
            <p className="text-xs text-slate-400 sm:text-sm">
              {isLoading
                ? "Carregando..."
                : data
                ? `Exibindo ${filteredBlockades.length} de ${data.pagination.total} interdições`
                : "Nenhuma interdição encontrada"}
            </p>
          </div>
        </header>

        {isLoading ? (
          <div className="flex h-48 items-center justify-center text-slate-400">
            <Loader2 className="size-5 animate-spin" />
            <span className="ml-2 text-sm">Carregando interdições...</span>
          </div>
        ) : !data || filteredBlockades.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center text-sm text-slate-400">
            <AlertCircle className="size-12 mb-4 text-slate-500" />
            <p>Nenhuma interdição encontrada com os filtros selecionados.</p>
          </div>
        ) : (
          <>
            {/* Versão Mobile - Cards */}
            <div className="block md:hidden space-y-3">
              {filteredBlockades.map((blockade) => (
                <div
                  key={blockade._id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-white text-sm flex-1">
                        {blockade.route.streetName}
                      </h3>
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold uppercase tracking-wide ${getTypeColor(
                          blockade.type
                        )}`}
                      >
                        {getTypeLabel(blockade.type)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="size-3" />
                      {blockade.route.neighborhood}
                    </p>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                      {blockade.reason}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold uppercase tracking-wide ${getStatusColor(
                        blockade.status
                      )}`}
                    >
                      {getStatusLabel(blockade.status)}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="size-3" />
                      {new Date(blockade.startDate).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                      {" - "}
                      {blockade.endDate ? new Date(blockade.endDate).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                      }) : "N/A"}
                    </span>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <label className="text-xs font-medium text-slate-400">
                      Atualizar Status
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={blockade.status}
                        onChange={(e) =>
                          handleStatusChange(blockade._id, e.target.value as BlockadeStatus)
                        }
                        className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none transition focus:border-emerald-400"
                      >
                        <option value="agendado">Agendado</option>
                        <option value="ativo">Ativo</option>
                        <option value="encerrado">Encerrado</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingBlockade(blockade);
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-sky-500/50 bg-sky-500/10 px-3 py-2 text-xs font-medium text-sky-300 transition hover:border-sky-400 hover:bg-sky-500/20"
                      >
                        <Edit className="size-3" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteClick(blockade)}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/50 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300 transition hover:border-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 className="size-3" />
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Versão Desktop - Tabela */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-[1000px] w-full divide-y divide-slate-800 text-left text-sm text-slate-200">
                <thead className="bg-slate-900/70 text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Rua / Bairro</th>
                    <th className="px-4 py-3 font-medium">Tipo</th>
                    <th className="px-4 py-3 font-medium">Período</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredBlockades.map((blockade) => (
                    <tr key={blockade._id} className="hover:bg-slate-900/60">
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-white">
                            {blockade.route.streetName}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                            <MapPin className="size-3" />
                            {blockade.route.neighborhood}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold uppercase tracking-wide ${getTypeColor(
                            blockade.type
                          )}`}
                        >
                          {getTypeLabel(blockade.type)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-200">
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            {new Date(blockade.startDate).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {blockade.endDate && (
                            <span className="text-xs text-slate-400">
                              até{" "}
                              {new Date(blockade.endDate).toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={blockade.status}
                          onChange={(e) =>
                            handleStatusChange(blockade._id, e.target.value as BlockadeStatus)
                          }
                          className={clsx(
                            "rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-medium uppercase tracking-wide text-slate-200 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
                          )}
                        >
                          <option value="agendado">Agendado</option>
                          <option value="ativo">Ativo</option>
                          <option value="encerrado">Encerrado</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingBlockade(blockade);
                            }}
                            className="inline-flex items-center gap-2 rounded-xl border border-sky-500/50 bg-sky-500/10 px-3 py-2 text-xs font-medium text-sky-300 transition hover:border-sky-400 hover:bg-sky-500/20"
                          >
                            <Edit className="size-3" />
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(blockade)}
                            className="inline-flex items-center gap-2 rounded-xl border border-red-500/50 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300 transition hover:border-red-400 hover:bg-red-500/20"
                          >
                            <Trash2 className="size-3" />
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Paginação */}
        {data && data.pagination.totalPages > 1 && (
          <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <p className="text-xs text-slate-400">
              Página {data.pagination.page} de {data.pagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-emerald-400 hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="size-4" />
                Anterior
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, data.pagination.totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setPage(pageNum)}
                      disabled={isLoading}
                      className={clsx(
                        "rounded-lg border px-2.5 py-1.5 text-xs font-medium transition",
                        pageNum === page
                          ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                          : "border-slate-700 bg-slate-900/80 text-slate-200 hover:border-emerald-400 hover:text-emerald-200",
                        isLoading && "disabled:cursor-not-allowed disabled:opacity-50"
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                disabled={page === data.pagination.totalPages || isLoading}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-emerald-400 hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Próxima
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Modal de criação */}
      <CreateBlockadeModal
        isOpen={showCreateModal && !editingBlockade}
        onClose={() => {
          setShowCreateModal(false);
        }}
      />
      
      {/* Modal de edição */}
      <EditBlockadeModal
        isOpen={!!editingBlockade}
        onClose={() => {
          setEditingBlockade(null);
        }}
        blockade={editingBlockade}
      />

      {/* Modal de exclusão */}
      <DeleteBlockadeModal
        isOpen={!!deletingBlockade}
        onClose={() => setDeletingBlockade(null)}
        onConfirm={handleDeleteConfirm}
        blockade={deletingBlockade}
        isDeleting={deleteBlockade.isPending}
      />
    </div>
  );
}

