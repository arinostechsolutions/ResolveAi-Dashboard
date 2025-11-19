"use client";

import { useEffect, useMemo, useState } from "react";
import { useCity } from "@/context/city-context";
import { useSecretariaFilter } from "@/context/secretaria-context";
import { useReportStatusOptions } from "@/hooks/use-report-status-options";
import { useReportsList, type ReportsListResponse } from "@/hooks/use-reports-list";
import { useUpdateReportStatus } from "@/hooks/use-update-report-status";
import { formatStatusLabel } from "@/lib/utils";
import { Loader2, Search, CheckCircle2, RefreshCcw, ChevronLeft, ChevronRight, MessageSquare, MapPin } from "lucide-react";
import { clsx } from "clsx";
import { toast } from "react-hot-toast";
import { useSearchParams, useRouter } from "next/navigation";
import { SendMessageModal } from "./send-message-modal";
import { ImagePreview } from "./image-preview";

function useDebouncedValue<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

export function ActionsDashboard() {
  const { cityId } = useCity();
  const { secretariaId } = useSecretariaFilter();
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialStatus = searchParams.get("status") ?? "pendente";
  const initialQuery = searchParams.get("q") ?? "";
  const initialPage = parseInt(searchParams.get("page") ?? "1", 10);
  const initialLimit = parseInt(searchParams.get("limit") ?? "2", 10);

  const statusOptionsQuery = useReportStatusOptions(cityId, secretariaId || undefined);
  const [statusFilter, setStatusFilter] = useState<string>(
    initialStatus || "pendente",
  );
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const debouncedSearch = useDebouncedValue(searchTerm);

  const reportsQuery = useReportsList({
    cityId,
    status: statusFilter,
    search: debouncedSearch,
    page: currentPage,
    limit: itemsPerPage,
    secretariaId: secretariaId || undefined,
  });

  const mutation = useUpdateReportStatus();

  const availableStatuses = useMemo(() => {
    const statuses = statusOptionsQuery.data?.statuses ?? [];
    if (!statuses.includes("pendente")) {
      statuses.unshift("pendente");
    }
    return Array.from(new Set(statuses));
  }, [statusOptionsQuery.data?.statuses]);

  const [draftStatuses, setDraftStatuses] = useState<Record<string, string>>({});
  const [selectedReportForMessage, setSelectedReportForMessage] = useState<{
    id: string;
    reportType: string;
  } | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const data = reportsQuery.data as ReportsListResponse | undefined;
      const list = data?.results ?? [];
      const map: Record<string, string> = {};
      list.forEach((report) => {
        map[report.id] = report.status;
      });
      setDraftStatuses(map);
    });
    return () => cancelAnimationFrame(id);
  }, [reportsQuery.data]);

  // Resetar para página 1 quando filtros ou limite mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, debouncedSearch, itemsPerPage]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter && statusFilter !== "pendente") {
      params.set("status", statusFilter);
    }
    if (debouncedSearch) {
      params.set("q", debouncedSearch);
    }
    if (currentPage > 1) {
      params.set("page", currentPage.toString());
    }
    if (itemsPerPage !== 2) {
      params.set("limit", itemsPerPage.toString());
    }
    router.replace(
      `/actions${params.toString() ? `?${params.toString()}` : ""}`,
      { scroll: false },
    );
  }, [statusFilter, debouncedSearch, currentPage, itemsPerPage, router]);

  const handleChangeStatus = (reportId: string, value: string) => {
    setDraftStatuses((prev) => ({
      ...prev,
      [reportId]: value,
    }));
  };

  const handleUpdateStatus = (reportId: string) => {
    if (!cityId) return;
    const newStatus = draftStatuses[reportId];
    if (!newStatus) return;
    mutation.mutate(
      {
        reportId,
        status: newStatus,
        cityId,
      },
      {
        onSuccess: () => {
          toast.success("Status atualizado com sucesso!");
        },
        onError: () => {
          toast.error("Não foi possível atualizar o status. Tente novamente.");
        },
      },
    );
  };


  return (
    <div className="flex min-h-full flex-col gap-6 pb-12">
      <header className="mb-2">
        <h1 className="text-2xl font-semibold text-white sm:text-3xl">
          Ações
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Atualize o status das ocorrências e acompanhe o processamento das demandas da cidade.
        </p>
      </header>
      <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-3 shadow-lg shadow-slate-900/30 sm:p-4 lg:p-6">

        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Filtrar por status
            </span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
            >
              <option value="all">Todos os status</option>
              {availableStatuses.map((status) => (
                <option key={status} value={status}>
                  {formatStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Buscar sugestões de melhorias
            </span>
            <div className="relative flex h-11 items-center rounded-xl border border-slate-800 bg-slate-950">
              <Search className="pointer-events-none ml-3 size-4 text-slate-500" />
              <input
                className="h-full w-full bg-transparent pl-3 pr-3 text-sm text-slate-100 outline-none placeholder:text-slate-500"
                placeholder="Digite tipo, endereço ou referência..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Itens por página
            </span>
            <select
              value={itemsPerPage}
              onChange={(event) => setItemsPerPage(parseInt(event.target.value, 10))}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
            >
              <option value="2">2</option>
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          <div className="flex items-end justify-end sm:col-span-2 lg:col-span-1">
            <button
              type="button"
              onClick={() => {
                setStatusFilter("pendente");
                setSearchTerm("");
                setCurrentPage(1);
                setItemsPerPage(2);
                router.replace("/actions");
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-3 sm:px-4 py-2 text-xs sm:text-sm text-slate-200 transition hover:border-emerald-400 hover:text-emerald-200"
            >
              <RefreshCcw className="size-3 sm:size-4" />
              <span className="hidden sm:inline">Resetar filtros</span>
              <span className="sm:hidden">Resetar</span>
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg shadow-slate-900/30 sm:p-6">
        <header className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-white sm:text-lg">
              Demandas recentes
            </h2>
            <p className="text-xs text-slate-400 sm:text-sm">
              {(() => {
                const data = reportsQuery.data as ReportsListResponse | undefined;
                if (!data) return "Carregando...";
                const start = (data.page - 1) * data.limit + 1;
                const end = Math.min(start + data.results.length - 1, data.total);
                return `Exibindo ${start}-${end} de ${data.total} registros`;
              })()}
            </p>
          </div>
        </header>

        {reportsQuery.isLoading ? (
          <div className="flex h-48 items-center justify-center text-slate-400">
            <Loader2 className="size-5 animate-spin" />
            <span className="ml-2 text-sm">Carregando sugestões de melhorias...</span>
          </div>
        ) : (() => {
          const data = reportsQuery.data as ReportsListResponse | undefined;
          return data && data.results.length > 0 ? (
          <>
            {/* Versão Mobile - Cards */}
            <div className="block md:hidden space-y-3">
              {data.results.map((report) => {
                const currentStatus = draftStatuses[report.id] ?? report.status;
                return (
                  <div
                    key={report.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3"
                  >
                    <div>
                      <h3 className="font-medium text-white text-sm mb-1">{report.reportType}</h3>
                      <p className="text-xs text-slate-400">{report.address}</p>
                      {report.referencia && (
                        <p className="text-xs text-slate-500 mt-1">Ref: {report.referencia}</p>
                      )}
                      {report.imageUrl && (
                        <div className="mt-2">
                          <ImagePreview
                            imageUrl={report.imageUrl}
                            alt={report.reportType}
                            size="md"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {report.bairro && (
                        <span className="text-xs text-slate-300">📍 {report.bairro}</span>
                      )}
                      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-300">
                        {formatStatusLabel(report.status)}
                      </span>
                    </div>
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <label className="text-xs font-medium text-slate-400">
                        Atualizar Status
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={currentStatus}
                          onChange={(e) => handleChangeStatus(report.id, e.target.value)}
                          className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none transition focus:border-emerald-400"
                        >
                          {availableStatuses.map((status) => (
                            <option key={status} value={status}>
                              {formatStatusLabel(status)}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleUpdateStatus(report.id)}
                          disabled={mutation.isPending || currentStatus === report.status}
                          className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                        >
                          {mutation.isPending ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="size-4" />
                          )}
                        </button>
                      </div>
                      <button
                        onClick={() => setSelectedReportForMessage({ id: report.id, reportType: report.reportType })}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-sky-500/50 bg-sky-500/10 px-3 py-2 text-xs font-medium text-sky-300 transition hover:border-sky-400 hover:bg-sky-500/20"
                      >
                        <MessageSquare className="size-3" />
                        Enviar Mensagem
                      </button>
                      <button
                        onClick={() => {
                          const params = new URLSearchParams();
                          params.set("q", report.id);
                          router.push(`/map?${params.toString()}`);
                        }}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300 transition hover:border-emerald-400 hover:bg-emerald-500/20"
                      >
                        <MapPin className="size-3" />
                        Ver no Mapa
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Versão Desktop - Tabela */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-[1000px] w-full divide-y divide-slate-800 text-left text-sm text-slate-200">
              <thead className="bg-slate-900/70 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Sugestão de Melhoria</th>
                  <th className="px-4 py-3 font-medium">Endereço</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Imagem</th>
                  <th className="px-4 py-3 font-medium">Ver no Mapa</th>
                  <th className="px-4 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.results.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-900/60">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-white">
                          {report.reportType}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(report.createdAt).toLocaleString("pt-BR", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-200">
                      <div className="flex flex-col gap-1">
                        <span>{report.address}</span>
                        <span className="text-xs text-slate-400">
                          {report.bairro ? `Bairro: ${report.bairro}` : "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={draftStatuses[report.id] ?? report.status}
                        onChange={(event) =>
                          handleChangeStatus(report.id, event.target.value)
                        }
                        className={clsx(
                          "rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-medium uppercase tracking-wide text-slate-200 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30",
                        )}
                      >
                        {availableStatuses.map((statusOption) => (
                          <option key={statusOption} value={statusOption}>
                            {formatStatusLabel(statusOption)}
                          </option>
                        ))}
                        {!availableStatuses.includes("resolvido") ? (
                          <option value="resolvido">Resolvido</option>
                        ) : null}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {report.imageUrl ? (
                        <ImagePreview
                          imageUrl={report.imageUrl}
                          alt={report.reportType}
                          size="sm"
                        />
                      ) : (
                        <span className="text-xs text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => {
                          const params = new URLSearchParams();
                          params.set("q", report.id);
                          router.push(`/map?${params.toString()}`);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-medium text-emerald-300 transition hover:border-emerald-400 hover:bg-emerald-500/20"
                        title="Ver no mapa"
                      >
                        <MapPin className="size-3" />
                        Ver no Mapa
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedReportForMessage({ id: report.id, reportType: report.reportType })}
                          className="inline-flex items-center gap-2 rounded-xl border border-sky-500/50 bg-sky-500/10 px-3 py-2 text-xs font-medium text-sky-300 transition hover:border-sky-400 hover:bg-sky-500/20"
                        >
                          <MessageSquare className="size-3" />
                          Mensagem
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(report.id)}
                          disabled={
                            mutation.isPending &&
                            mutation.variables?.reportId === report.id
                          }
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {mutation.isPending &&
                          mutation.variables?.reportId === report.id ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            <CheckCircle2 className="size-3" />
                          )}
                          Salvar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          </>
          ) : (
          <div className="flex h-48 items-center justify-center text-sm text-slate-400">
            Nenhuma sugestão de melhoria encontrada com os filtros selecionados.
          </div>
        );
        })()}

        {/* Paginação */}
        {(() => {
          const data = reportsQuery.data as ReportsListResponse | undefined;
          if (!data || data.totalPages <= 1) return null;

          const pagesToShow = 5;
          const currentPageNum = data.page;
          const totalPages = data.totalPages;
          
          let startPage = Math.max(1, currentPageNum - Math.floor(pagesToShow / 2));
          let endPage = Math.min(totalPages, startPage + pagesToShow - 1);
          
          if (endPage - startPage < pagesToShow - 1) {
            startPage = Math.max(1, endPage - pagesToShow + 1);
          }

          return (
            <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
              <p className="text-xs text-slate-400">
                Página {currentPageNum} de {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPageNum === 1 || reportsQuery.isLoading}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-emerald-400 hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="size-4" />
                  Anterior
                </button>
                
                <div className="flex items-center gap-1">
                  {startPage > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setCurrentPage(1)}
                        className="rounded-lg border border-slate-700 bg-slate-900/80 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition hover:border-emerald-400 hover:text-emerald-200"
                      >
                        1
                      </button>
                      {startPage > 2 && (
                        <span className="px-2 text-xs text-slate-500">...</span>
                      )}
                    </>
                  )}
                  
                  {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      disabled={reportsQuery.isLoading}
                      className={clsx(
                        "rounded-lg border px-2.5 py-1.5 text-xs font-medium transition",
                        page === currentPageNum
                          ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                          : "border-slate-700 bg-slate-900/80 text-slate-200 hover:border-emerald-400 hover:text-emerald-200",
                        reportsQuery.isLoading && "disabled:cursor-not-allowed disabled:opacity-50"
                      )}
                    >
                      {page}
                    </button>
                  ))}
                  
                  {endPage < totalPages && (
                    <>
                      {endPage < totalPages - 1 && (
                        <span className="px-2 text-xs text-slate-500">...</span>
                      )}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(totalPages)}
                        className="rounded-lg border border-slate-700 bg-slate-900/80 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition hover:border-emerald-400 hover:text-emerald-200"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>
                
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPageNum === totalPages || reportsQuery.isLoading}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-emerald-400 hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Próxima
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          );
        })()}
      </section>

      {/* Modal de Enviar Mensagem */}
      {selectedReportForMessage && (
        <SendMessageModal
          isOpen={!!selectedReportForMessage}
          onClose={() => setSelectedReportForMessage(null)}
          reportId={selectedReportForMessage.id}
          reportType={selectedReportForMessage.reportType}
        />
      )}
    </div>
  );
}

