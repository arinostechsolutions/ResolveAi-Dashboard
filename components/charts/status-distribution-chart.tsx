"use client";

import { useEffect, useRef, useState } from "react";
import {
  Pie,
  PieChart,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ReportsSummaryResponse } from "@/types/dashboard";
import { formatStatusLabel } from "@/lib/utils";

const COLORS = ["#34d399", "#60a5fa", "#fbbf24", "#f472b6", "#a855f7"];

type StatusDistributionChartProps = {
  byStatus: ReportsSummaryResponse["byStatus"];
};

export function StatusDistributionChart({
  byStatus,
}: StatusDistributionChartProps) {
  const total = byStatus.reduce((acc, item) => acc + item.total, 0);
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
      className="min-h-[320px] w-full overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 px-6 pt-6 pb-12 shadow-lg shadow-slate-900/30"
    >
      <header className="mb-6">
        <h2 className="text-lg font-semibold text-white">
          Distribuição por status
        </h2>
        <p className="text-sm text-slate-400">
          Percentual de denúncias em cada etapa do fluxo operacional.
        </p>
      </header>

      {!isReady ? (
        <div className="flex h-52 items-center justify-center text-sm text-slate-400">
          Preparando visualização...
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart
              margin={{
                top: 12,
                right: 12,
                bottom: 24,
                left: 12,
              }}
            >
              <Pie
                data={byStatus}
                dataKey="total"
                nameKey="status"
                cx="50%"
                cy="52%"
                innerRadius={38}
                outerRadius={88}
                paddingAngle={4}
              >
                {byStatus.map((entry, index) => (
                  <Cell
                    key={entry.status}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, _, { payload }) => [
                  value,
              `${formatStatusLabel(payload.status)} (${Math.round((value / total) * 100)}%)`,
                ]}
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderRadius: "0.75rem",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  color: "#f8fafc",
                  boxShadow: "0 10px 25px rgba(15, 23, 42, 0.35)",
                }}
                labelStyle={{
                  color: "#f8fafc",
                }}
                itemStyle={{
                  color: "#f8fafc",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

