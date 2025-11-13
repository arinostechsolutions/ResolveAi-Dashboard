"use client";

import {
  ArrowUpRight,
  TrendingUp,
  Timer,
} from "lucide-react";
import { TopReportsResponse } from "@/types/dashboard";
import { formatStatusLabel } from "@/lib/utils";

type TopReportsTableProps = {
  data: TopReportsResponse["results"];
  onFollow?: (report: TopReportsResponse["results"][number]) => void;
};

export function TopReportsTable({ data, onFollow }: TopReportsTableProps) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/60 shadow-lg shadow-slate-900/30">
      <header className="flex items-center justify-between px-3 py-3 sm:px-6 sm:py-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-white sm:text-lg">
            Irregularidades em destaque
          </h2>
          <p className="text-xs text-slate-400 sm:text-sm">
            Casos com maior engajamento ou mais tempo aguardando resolução.
          </p>
        </div>
        <TrendingUp className="size-5 text-emerald-400 shrink-0 ml-2" />
      </header>
      <div className="overflow-x-auto">
        <table className="min-w-[800px] w-full divide-y divide-slate-800 text-left text-sm text-slate-200">
          <thead className="bg-slate-900/70 uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-6 py-3 font-medium">Irregularidade</th>
              <th className="px-6 py-3 font-medium">Bairro</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Engajamento</th>
              <th className="px-6 py-3 font-medium">Registrada em</th>
              <th className="px-6 py-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {data.map((report) => (
              <tr key={report.id} className="hover:bg-slate-900/60">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-white">
                      {report.reportType}
                    </span>
                    <span className="text-xs text-slate-400">
                      {report.address}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-300">
                  {report.bairro ?? "—"}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-300">
                    {formatStatusLabel(report.status)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 sm:gap-4">
                    <span>Likes: {report.likesCount}</span>
                    <span>Views: {report.viewsCount}</span>
                    <span>Shares: {report.sharesCount}</span>
                    <span className="inline-flex items-center gap-1 text-emerald-300">
                      <TrendingUp className="size-3" />
                      {report.engagementScore.toFixed(0)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-300">
                  {new Date(report.createdAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex flex-col gap-2 items-end sm:flex-row sm:items-center">
                    <button
                      className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-2 text-xs font-medium text-emerald-300 transition hover:border-emerald-400 hover:text-emerald-200 whitespace-nowrap"
                      onClick={() => onFollow?.(report)}
                    >
                      <Timer className="size-3" />
                      Acompanhar
                    </button>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        report.address,
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-sky-300 transition hover:text-sky-200 whitespace-nowrap"
                    >
                      Ver no mapa
                      <ArrowUpRight className="size-3" />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

