"use client";

import { useMemo, useState } from "react";
import { useCity } from "@/context/city-context";
import { useReportsMap } from "@/hooks/use-reports-map";
import { ReportsMap } from "@/components/map/reports-map";
import { clsx } from "clsx";
import { useReportStatusOptions } from "@/hooks/use-report-status-options";
import { formatStatusLabel } from "@/lib/utils";

export function MapDashboard() {
  const { cityId } = useCity();
  const [status, setStatus] = useState<string>("pendente");
  const [reportType, setReportType] = useState<string>("");

  const statusOptionsQuery = useReportStatusOptions(cityId);

  const statusFilters = useMemo(() => {
    const statuses = statusOptionsQuery.data?.statuses ?? [];
    const unique = Array.from(new Set(["pendente", ...statuses]));
    return unique;
  }, [statusOptionsQuery.data?.statuses]);

  const map = useReportsMap({
    cityId,
    status: status === "all" ? undefined : status,
    reportType: reportType || undefined,
  });

  const data = map.data;

  return (
    <div className="flex flex-col gap-6 pb-12">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-slate-900/30">
        <header className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">
              Mapa estratégico
            </h1>
            <p className="text-sm text-slate-400">
              Use os filtros para focar em regiões ou categorias prioritárias.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatus("all")}
                className={clsx(
                  "rounded-full px-4 py-2 text-xs font-medium uppercase tracking-wide transition",
                  status === "all"
                    ? "bg-emerald-500 text-emerald-950 shadow-lg shadow-emerald-500/30"
                    : "border border-slate-700 bg-transparent text-slate-300 hover:border-emerald-400 hover:text-emerald-200",
                )}
              >
                Todos
              </button>
              {statusFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatus(filter)}
                  className={clsx(
                    "rounded-full px-4 py-2 text-xs font-medium uppercase tracking-wide transition",
                    status === filter
                      ? "bg-emerald-500 text-emerald-950 shadow-lg shadow-emerald-500/30"
                      : "border border-slate-700 bg-transparent text-slate-300 hover:border-emerald-400 hover:text-emerald-200",
                  )}
                >
                  {formatStatusLabel(filter)}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Filtrar por tipo (ex: Iluminação)"
              value={reportType}
              onChange={(event) => setReportType(event.target.value)}
              className="h-10 rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100 outline-none ring-emerald-400 placeholder:text-slate-500 focus:ring-2"
            />
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Total exibido
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {map.isLoading ? "—" : data?.total ?? 0}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Status filtrado
            </p>
            <p className="mt-2 text-lg font-medium text-emerald-300">
              {status === "all" ? "Todos" : formatStatusLabel(status)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 md:col-span-2">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Tipo
            </p>
            <p className="mt-2 text-sm text-slate-300">
              {reportType ? reportType : "Todos os tipos"}
            </p>
          </div>
        </div>
      </section>

      <div className="h-[30rem] w-full lg:h-[34rem]">
        <ReportsMap data={data} cityId={cityId} />
      </div>
    </div>
  );
}

