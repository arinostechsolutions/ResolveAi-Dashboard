"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendData } from "@/hooks/use-analytics";

type TrendsChartProps = {
  data: TrendData[];
  isLoading?: boolean;
  groupBy: "day" | "week" | "month";
  showTrendLine?: boolean;
};

const formatDate = (date: string, groupBy: "day" | "week" | "month") => {
  if (groupBy === "week") {
    return date;
  }
  if (groupBy === "month") {
    const [year, month] = date.split("-");
    return `${month}/${year}`;
  }
  const d = new Date(date);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
};

// Função para calcular regressão linear (linha de tendência)
function calculateTrendLine(data: Array<{ date: string; total: number }>) {
  if (data.length < 2) return [];

  const n = data.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  data.forEach((point, index) => {
    const x = index;
    const y = point.total;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return data.map((point, index) => ({
    date: point.date,
    trend: slope * index + intercept,
  }));
}

export function TrendsChart({ data, isLoading, groupBy, showTrendLine = true }: TrendsChartProps) {
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

  const chartData = useMemo(() => {
    const formatted = data.map((item) => ({
      date: formatDate(item.date, groupBy),
      originalDate: item.date,
      total: item.total,
      pendente: item.pendente,
      em_andamento: item.em_andamento,
      resolvido: item.resolvido,
    }));

    // Calcular linha de tendência apenas para o total
    if (showTrendLine && formatted.length >= 2) {
      const trendData = calculateTrendLine(formatted.map((d) => ({ date: d.originalDate, total: d.total })));
      return formatted.map((item, index) => ({
        ...item,
        trend: trendData[index]?.trend || null,
      }));
    }

    return formatted;
  }, [data, groupBy, showTrendLine]);

  return (
    <div
      ref={containerRef}
      className="min-h-[400px] w-full overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 px-3 pt-4 pb-8 sm:px-6 sm:pt-6 sm:pb-12 shadow-lg shadow-slate-900/30"
    >
      <header className="mb-4 sm:mb-6">
        <h2 className="text-base font-semibold text-white sm:text-lg">
          Tendências Temporais
        </h2>
        <p className="mt-1 text-xs text-slate-400 sm:text-sm">
          Evolução de irregularidades ao longo do tempo
        </p>
      </header>

      {isLoading ? (
        <div className="flex h-80 items-center justify-center text-sm text-slate-400">
          Carregando dados...
        </div>
      ) : !isReady ? (
        <div className="flex h-80 items-center justify-center text-sm text-slate-400">
          Preparando visualização...
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex h-80 items-center justify-center text-sm text-slate-400">
          Nenhum dado disponível
        </div>
      ) : (
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                fontSize={11}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderRadius: "0.75rem",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  color: "#f8fafc",
                }}
                itemStyle={{
                  color: "#f8fafc",
                }}
                labelStyle={{
                  color: "#f8fafc",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#22d3ee"
                strokeWidth={2}
                name="Total"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              {showTrendLine && chartData.some((d) => d.trend !== null) && (
                <Line
                  type="linear"
                  dataKey="trend"
                  stroke="#ec4899"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Linha de Tendência"
                  dot={false}
                  connectNulls={false}
                />
              )}
              <Line
                type="monotone"
                dataKey="pendente"
                stroke="#f59e0b"
                strokeWidth={2}
                name="Pendente"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="em_andamento"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Em Andamento"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="resolvido"
                stroke="#10b981"
                strokeWidth={2}
                name="Resolvido"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
