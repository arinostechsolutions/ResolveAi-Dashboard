"use client";

import { useEffect, useMemo, useState } from "react";
import { useCity } from "@/context/city-context";
import { useReportStatusOptions } from "@/hooks/use-report-status-options";
import { useReportsList } from "@/hooks/use-reports-list";
import { useUpdateReportStatus } from "@/hooks/use-update-report-status";
import { formatStatusLabel } from "@/lib/utils";
import { Loader2, Search, CheckCircle2, RefreshCcw } from "lucide-react";
import { clsx } from "clsx";
import { toast } from "react-hot-toast";
import { useSearchParams, useRouter } from "next/navigation";

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
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialStatus = searchParams.get("status") ?? "pendente";
  const initialQuery = searchParams.get("q") ?? "";

  const statusOptionsQuery = useReportStatusOptions(cityId);
  const [statusFilter, setStatusFilter] = useState<string>(
    initialStatus || "pendente",
  );
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const debouncedSearch = useDebouncedValue(searchTerm);

  const reportsQuery = useReportsList({
    cityId,
    status: statusFilter,
    search: debouncedSearch,
    limit: 10,
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

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const results = reportsQuery.data?.results ?? [];
      const map: Record<string, string> = {};
      results.forEach((report) => {
        map[report.id] = report.status;
      });
      setDraftStatuses(map);
    });
    return () => cancelAnimationFrame(id);
  }, [reportsQuery.data?.results]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter && statusFilter !== "pendente") {
      params.set("status", statusFilter);
    }
    if (debouncedSearch) {
      params.set("q", debouncedSearch);
    }
    router.replace(
      `/actions${params.toString() ? `?${params.toString()}` : ""}`,
      { scroll: false },
    );
  }, [statusFilter, debouncedSearch, router]);

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
      <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-slate-900/30">
        <header className="mb-6 space-y-2">
          <h1 className="text-2xl font-semibold text-white">
            Ações e acompanhamento
          </h1>
          <p className="text-sm text-slate-400">
            Atualize o status das ocorrências e acompanhe o processamento das demandas da cidade.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-4">
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
              Buscar denúncias
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

          <div className="flex items-end justify-end">
            <button
              type="button"
              onClick={() => {
                setStatusFilter("pendente");
                setSearchTerm("");
                const params = new URLSearchParams(searchParams.toString());
                params.delete("status");
                params.delete("q");
                router.replace(`/actions${params.toString() ? `?${params.toString()}` : ""}`);
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-emerald-400 hover:text-emerald-200"
            >
              <RefreshCcw className="size-4" />
              Resetar filtros
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-slate-900/30">
        <header className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Demandas recentes
            </h2>
            <p className="text-sm text-slate-400">
              {`Exibindo ${reportsQuery.data?.results.length ?? 0} de ${reportsQuery.data?.total ?? 0} registros`}
            </p>
          </div>
        </header>

        {reportsQuery.isLoading ? (
          <div className="flex h-48 items-center justify-center text-slate-400">
            <Loader2 className="size-5 animate-spin" />
            <span className="ml-2 text-sm">Carregando denúncias...</span>
          </div>
        ) : reportsQuery.data && reportsQuery.data.results.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-200">
              <thead className="bg-slate-900/70 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Denúncia</th>
                  <th className="px-4 py-3 font-medium">Endereço</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {reportsQuery.data.results.map((report) => (
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
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(report.id)}
                        disabled={
                          mutation.isLoading &&
                          mutation.variables?.reportId === report.id
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {mutation.isLoading &&
                        mutation.variables?.reportId === report.id ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <CheckCircle2 className="size-3" />
                        )}
                        Salvar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex h-48 items-center justify-center text-sm text-slate-400">
            Nenhuma denúncia encontrada com os filtros selecionados.
          </div>
        )}
      </section>
    </div>
  );
}

