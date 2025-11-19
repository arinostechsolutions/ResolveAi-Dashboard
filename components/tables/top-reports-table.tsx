/* eslint-disable @next/next/no-img-element */
"use client";

import {
  ArrowUpRight,
  Timer,
} from "lucide-react";
import { TopReportsResponse } from "@/types/dashboard";
import { formatStatusLabel } from "@/lib/utils";
import { ImagePreview } from "@/components/dashboard/image-preview";

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
            Sugestões de Melhorias em destaque
          </h2>
          <p className="text-xs text-slate-400 sm:text-sm">
            Casos com maior engajamento ou mais tempo aguardando resolução.
          </p>
        </div>
      </header>
      
      {/* Versão Mobile - Cards */}
      <div className="block md:hidden space-y-3 px-3 pb-4">
        {data.map((report) => (
          <div
            key={report.id}
            className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3"
          >
            <div>
              <h3 className="font-medium text-white text-sm mb-1">{report.reportType}</h3>
              <p className="text-xs text-slate-400">{report.address}</p>
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
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {report.bairro && (
                <span className="text-slate-300">📍 {report.bairro}</span>
              )}
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-300">
                {formatStatusLabel(report.status)}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <span>❤️ {report.likesCount}</span>
              <span>👁️ {report.viewsCount}</span>
              <span>📤 {report.sharesCount}</span>
              <span className="text-slate-400">
                {new Date(report.createdAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
              <button
                className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-slate-700 px-3 py-2 text-xs font-medium text-emerald-300 transition hover:border-emerald-400 hover:text-emerald-200"
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
                className="w-full inline-flex items-center justify-center gap-1 text-xs text-sky-300 transition hover:text-sky-200"
              >
                Ver no mapa
                <ArrowUpRight className="size-3" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Versão Desktop - Tabela */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-[1000px] w-full divide-y divide-slate-800 text-left text-sm text-slate-200">
          <thead className="bg-slate-900/70 uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-6 py-3 font-medium">Sugestão de Melhoria</th>
              <th className="px-6 py-3 font-medium">Bairro</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Engajamento</th>
              <th className="px-6 py-3 font-medium">Imagem</th>
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
                  </div>
                </td>
                <td className="px-6 py-4">
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

