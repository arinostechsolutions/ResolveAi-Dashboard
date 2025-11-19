"use client";

import { useEffect, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ReportsSummaryResponse } from "@/types/dashboard";

type ReportsTrendChartProps = {
  timeline: ReportsSummaryResponse["timeline"];
};

const formatDate = (value: string) => {
  const date = new Date(value);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
};

export function ReportsTrendChart({ timeline }: ReportsTrendChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        setIsReady(true);
      }
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-[320px] w-full overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 px-3 pt-4 pb-8 sm:px-6 sm:pt-6 sm:pb-12 shadow-lg shadow-slate-900/30"
    >
      <header className="mb-4 flex items-center justify-between sm:mb-6">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-white sm:text-lg">
            Evolução de sugestões de melhorias
          </h2>
          <p className="text-xs text-slate-400 sm:text-sm">
            Total diário de sugestões de melhorias registradas na plataforma ResolveAI.
          </p>
        </div>
      </header>

      {!isReady ? (
        <div className="flex h-56 items-center justify-center text-sm text-slate-400">
          Preparando visualização...
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeline}>
              <defs>
                <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                fontSize={12}
                tickFormatter={formatDate}
              />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderRadius: "0.75rem",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  color: "#f8fafc",
                }}
                labelFormatter={(value) =>
                  new Date(value).toLocaleDateString("pt-BR")
                }
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#38bdf8"
                strokeWidth={2.5}
                fill="url(#colorReports)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

