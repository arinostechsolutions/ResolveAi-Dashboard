"use client";

import { Trophy, Medal, Award, TrendingUp, MapPin, Calendar, Info } from "lucide-react";
import { TopReportsResponse } from "@/types/dashboard";
import { formatStatusLabel } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

type EngagementRankingProps = {
  data: TopReportsResponse["results"];
  isLoading?: boolean;
};

const getRankIcon = (position: number) => {
  switch (position) {
    case 1:
      return <Trophy className="size-5 text-yellow-400" />;
    case 2:
      return <Medal className="size-5 text-slate-300" />;
    case 3:
      return <Award className="size-5 text-amber-600" />;
    default:
      return (
        <span className="flex size-6 items-center justify-center rounded-full bg-slate-700 text-xs font-semibold text-slate-300">
          {position}
        </span>
      );
  }
};

const getRankBadgeColor = (position: number) => {
  switch (position) {
    case 1:
      return "bg-gradient-to-r from-yellow-500/20 to-yellow-400/10 border-yellow-500/50";
    case 2:
      return "bg-gradient-to-r from-slate-400/20 to-slate-300/10 border-slate-400/50";
    case 3:
      return "bg-gradient-to-r from-amber-600/20 to-amber-500/10 border-amber-600/50";
    default:
      return "bg-slate-900/60 border-slate-800";
  }
};

export function EngagementRanking({ data, isLoading }: EngagementRankingProps) {
  const router = useRouter();

  const handleReportClick = useCallback(
    (report: TopReportsResponse["results"][number]) => {
      const query = new URLSearchParams();
      query.set("q", report.id);
      query.set("status", report.status || "all");
      router.push(`/actions?${query.toString()}`);
    },
    [router],
  );

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-slate-900/30">
        <div className="flex h-64 items-center justify-center text-slate-400">
          Carregando ranking...
        </div>
      </section>
    );
  }

  if (!data || data.length === 0) {
    return null;
  }

  // Mostrar apenas top 3 mais engajados
  const topRanking = data.slice(0, 3);

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-slate-900/30">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
            <TrendingUp className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              Ranking de Engajamento
            </h2>
            <p className="text-xs text-slate-400">
              Sugestões de Melhorias mais importantes da cidade
            </p>
          </div>
        </div>
      </header>

      <div className="space-y-3">
        {topRanking.map((report, index) => {
          const position = index + 1;
          const totalEngagement = report.likesCount + report.viewsCount + report.sharesCount;

          return (
            <button
              key={report.id}
              onClick={() => handleReportClick(report)}
              className={`w-full cursor-pointer rounded-2xl border p-4 text-left transition hover:scale-[1.02] hover:shadow-lg ${getRankBadgeColor(position)}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex shrink-0 items-center justify-center">
                  {getRankIcon(position)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-white">
                        {report.reportType}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-300">
                        {report.bairro && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="size-3" />
                            {report.bairro}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="size-3" />
                          {new Date(report.createdAt).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                      {formatStatusLabel(report.status)}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span className="group relative inline-flex items-center gap-1 font-medium text-emerald-300">
                      <TrendingUp className="size-3" />
                      Score: {report.engagementScore.toFixed(0)}
                      <Info className="size-3 cursor-help opacity-60 transition-opacity hover:opacity-100" />
                      <div className="absolute bottom-full left-1/2 z-50 mb-2 hidden w-64 -translate-x-1/2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-200 shadow-xl group-hover:block">
                        <div className="font-semibold text-emerald-300 mb-1">
                          Score de Engajamento
                        </div>
                        <div className="space-y-1 text-slate-300">
                          <p>O score é calculado com base nas interações:</p>
                          <ul className="list-inside list-disc space-y-0.5 ml-2">
                            <li>Curtidas: peso 3</li>
                            <li>Visualizações: peso 1</li>
                            <li>Compartilhamentos: peso 5</li>
                          </ul>
                          <p className="mt-1 text-slate-400">
                            Fórmula: (Likes × 3) + (Views × 1) + (Shares × 5)
                          </p>
                        </div>
                        <div className="absolute left-1/2 top-full -translate-x-1/2 -mt-px">
                          <div className="border-4 border-transparent border-t-slate-700"></div>
                        </div>
                      </div>
                    </span>
                    <span className="font-medium text-slate-300">
                      {totalEngagement} interações
                    </span>
                    <span>❤️ {report.likesCount}</span>
                    <span>👁️ {report.viewsCount}</span>
                    <span>📤 {report.sharesCount}</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {data.length > 3 && (
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-500">
            Mostrando top 3 de {data.length} sugestões de melhorias
          </p>
        </div>
      )}
    </section>
  );
}

