"use client";

import { useState, useCallback } from "react";
import { useCity } from "@/context/city-context";
import { useReportsSummary } from "@/hooks/use-reports-summary";
import { useTopReports } from "@/hooks/use-top-reports";
import { TopReportsTable } from "@/components/tables/top-reports-table";
import { SummaryCard } from "@/components/cards/summary-card";
import { Layers, MapPin, FileText, ChevronLeft, ChevronRight, Download, FileDown } from "lucide-react";
import { clsx } from "clsx";
import { convertToCSV, downloadCSV, formatDateForFilename, exportToPDF } from "@/lib/export-utils";
import { toast } from "react-hot-toast";

const formatNumber = (value: number) =>
  new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(value);

export function ReportsDashboard() {
  const { cityId } = useCity();
  const summary = useReportsSummary({ cityId });
  const [topReportsPage, setTopReportsPage] = useState(1);
  const [topReportsLimit, setTopReportsLimit] = useState(2);
  const topReports = useTopReports({ 
    cityId, 
    sort: "oldest", 
    status: "all", 
    limit: topReportsLimit,
    page: topReportsPage,
  });

  const pendingTotal =
    summary.data?.byStatus.find((item) => item.status === "pendente")
      ?.total ?? 0;
  const inProgressTotal =
    summary.data?.byStatus.find((item) => item.status === "em_andamento")
      ?.total ?? 0;

  const handleExportCSV = useCallback(() => {
    if (!topReports.data || topReports.data.results.length === 0) {
      toast.error("Não há dados para exportar.");
      return;
    }

    const headers: Record<string, string> = {
      id: "ID",
      reportType: "Tipo de Irregularidade",
      address: "Endereço",
      bairro: "Bairro",
      status: "Status",
      engagementScore: "Score de Engajamento",
      likesCount: "Curtidas",
      viewsCount: "Visualizações",
      sharesCount: "Compartilhamentos",
      createdAt: "Data de Criação",
    };

    const csvContent = convertToCSV(topReports.data.results, headers);
    const filename = `relatorio_irregularidades_${formatDateForFilename()}.csv`;
    downloadCSV(csvContent, filename);
    toast.success("Dados exportados em CSV com sucesso!");
  }, [topReports.data]);

  const handleExportPDF = useCallback(async () => {
    if (!topReports.data || topReports.data.results.length === 0) {
      toast.error("Não há dados para exportar.");
      return;
    }

    try {
      const headers: Record<string, string> = {
        id: "ID",
        reportType: "Tipo",
        address: "Endereço",
        bairro: "Bairro",
        status: "Status",
        engagementScore: "Engajamento",
        createdAt: "Data",
      };

      const title = "Relatório de Irregularidades";
      const filename = `relatorio_irregularidades_${formatDateForFilename()}.pdf`;
      
      await exportToPDF(topReports.data.results, headers, title, filename);
      toast.success("Dados exportados em PDF com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      toast.error("Erro ao exportar PDF. Tente novamente.");
    }
  }, [topReports.data]);

  return (
    <div className="flex flex-col gap-6 pb-12 overflow-x-hidden">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 overflow-x-hidden">
        <SummaryCard
          title="Pendentes"
          value={
            summary.isLoading ? "—" : formatNumber(pendingTotal)
          }
          description="Irregularidades aguardando triagem ou encaminhamento."
          icon={<FileText className="size-6" />}
          tone="amber"
        />
        <SummaryCard
          title="Em andamento"
          value={
            summary.isLoading ? "—" : formatNumber(inProgressTotal)
          }
          description="Equipes da prefeitura já estão atuando nesses casos."
          icon={<Layers className="size-6" />}
          tone="sky"
        />
        <SummaryCard
          title="Bairros atendidos"
          value={
            summary.isLoading
              ? "—"
              : formatNumber(summary.data?.byNeighborhood.length ?? 0)
          }
          description="Cobertura atual das solicitações pela cidade."
          icon={<MapPin className="size-6" />}
          tone="emerald"
        />
        <SummaryCard
          title="Tipos de irregularidade"
          value={
            summary.isLoading
              ? "—"
              : formatNumber(summary.data?.byType.length ?? 0)
          }
          description="Categorias ativas configuradas no módulo ResolveAI."
          icon={<Layers className="size-6" />}
          tone="violet"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 overflow-x-hidden">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Itens por página:
              </span>
              <select
                value={topReportsLimit}
                onChange={(event) => {
                  setTopReportsLimit(parseInt(event.target.value, 10));
                  setTopReportsPage(1);
                }}
                className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
              >
                <option value="2">2</option>
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              {topReports.data && (
                <p className="text-xs text-slate-400">
                  {(() => {
                    const data = topReports.data;
                    const start = (data.page - 1) * data.limit + 1;
                    const end = Math.min(start + data.results.length - 1, data.total);
                    return `Exibindo ${start}-${end} de ${data.total} irregularidades`;
                  })()}
                </p>
              )}
              {topReports.data && topReports.data.results.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300 transition hover:border-emerald-400 hover:bg-emerald-500/20"
                  >
                    <Download className="size-3" />
                    CSV
                  </button>
                  <button
                    type="button"
                    onClick={handleExportPDF}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-500/50 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300 transition hover:border-red-400 hover:bg-red-500/20"
                  >
                    <FileDown className="size-3" />
                    PDF
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
            {topReports.isLoading ? (
              <div className="flex h-64 items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/60 text-slate-400">
                Carregando fila de atendimentos...
              </div>
            ) : topReports.data && topReports.data.results.length > 0 ? (
              <>
                <TopReportsTable data={topReports.data.results} />
                {/* Paginação */}
                {topReports.data.totalPages > 1 && (
                  <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                    <p className="text-xs text-slate-400">
                      Página {topReports.data.page} de {topReports.data.totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setTopReportsPage((prev) => Math.max(1, prev - 1))}
                        disabled={topReports.data.page === 1 || topReports.isLoading}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-emerald-400 hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <ChevronLeft className="size-4" />
                        Anterior
                      </button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, topReports.data.totalPages) }, (_, i) => {
                          let pageNum;
                          if (topReports.data.totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (topReports.data.page <= 3) {
                            pageNum = i + 1;
                          } else if (topReports.data.page >= topReports.data.totalPages - 2) {
                            pageNum = topReports.data.totalPages - 4 + i;
                          } else {
                            pageNum = topReports.data.page - 2 + i;
                          }
                          return pageNum;
                        }).map((page) => (
                          <button
                            key={page}
                            type="button"
                            onClick={() => setTopReportsPage(page)}
                            disabled={topReports.isLoading}
                            className={clsx(
                              "rounded-lg border px-2.5 py-1.5 text-xs font-medium transition",
                              page === topReports.data.page
                                ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                                : "border-slate-700 bg-slate-900/80 text-slate-200 hover:border-emerald-400 hover:text-emerald-200",
                              topReports.isLoading && "disabled:cursor-not-allowed disabled:opacity-50"
                            )}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => setTopReportsPage((prev) => Math.min(topReports.data!.totalPages, prev + 1))}
                        disabled={topReports.data.page === topReports.data.totalPages || topReports.isLoading}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-emerald-400 hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Próxima
                        <ChevronRight className="size-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/60 text-slate-400">
                <p className="text-sm font-medium text-slate-300">
                  Nenhuma irregularidade encontrada
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Não há irregularidades cadastradas para esta cidade no momento.
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="space-y-6 xl:col-span-1">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-slate-900/30">
            <h3 className="text-base font-semibold text-white">
              Tipos mais frequentes
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              {summary.data?.byType.slice(0, 6).map((item) => (
                <li
                  key={item.type}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2"
                >
                  <span>{item.type}</span>
                  <span className="text-emerald-300">{item.total}</span>
                </li>
              )) ?? (
                <li className="text-slate-400">Carregando...</li>
              )}
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-slate-900/30">
            <h3 className="text-base font-semibold text-white">
              Bairros mais impactados
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              {summary.data?.byNeighborhood.slice(0, 6).map((item) => (
                <li
                  key={item.neighborhood}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2"
                >
                  <span>{item.neighborhood}</span>
                  <span className="text-sky-300">{item.total}</span>
                </li>
              )) ?? (
                <li className="text-slate-400">Carregando...</li>
              )}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

