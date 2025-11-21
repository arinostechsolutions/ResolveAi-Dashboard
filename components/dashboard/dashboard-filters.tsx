"use client";

import { useEffect, useState, useMemo } from "react";
import { Calendar, RotateCcw } from "lucide-react";
import { clsx } from "clsx";

export type DashboardDateRange = {
  startDate?: string;
  endDate?: string;
};

type DashboardFiltersProps = {
  currentRange: DashboardDateRange;
  onApply: (range: DashboardDateRange) => void;
};

const QUICK_OPTIONS = [
  {
    label: "Últimos 7 dias",
    value: 7,
  },
  {
    label: "Últimos 30 dias",
    value: 30,
  },
  {
    label: "Últimos 90 dias",
    value: 90,
  },
];

function formatDateToInput(date: Date) {
  return date.toISOString().split("T")[0];
}

function getQuickRangeDates(days: number) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (days - 1));
  return {
    start: formatDateToInput(start),
    end: formatDateToInput(end),
  };
}

export function DashboardFilters({
  currentRange,
  onApply,
}: DashboardFiltersProps) {
  const [startDate, setStartDate] = useState<string>(currentRange?.startDate ?? "");
  const [endDate, setEndDate] = useState<string>(currentRange?.endDate ?? "");

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setStartDate(currentRange?.startDate ?? "");
      setEndDate(currentRange?.endDate ?? "");
    });
    return () => cancelAnimationFrame(id);
  }, [currentRange?.startDate, currentRange?.endDate]);

  const handleApply = () => {
    onApply({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  };

  const handleClear = () => {
    setStartDate("");
    setEndDate("");
    onApply({});
  };

  const handleQuickSelect = (days: number) => {
    const { start, end } = getQuickRangeDates(days);
    setStartDate(start);
    setEndDate(end);
    onApply({
      startDate: start,
      endDate: end,
    });
  };

  // Verificar qual intervalo rápido está ativo
  const activeQuickOption = useMemo(() => {
    if (!currentRange?.startDate || !currentRange?.endDate) {
      return null;
    }

    // Comparar as datas atuais com cada opção rápida
    for (const option of QUICK_OPTIONS) {
      const { start, end } = getQuickRangeDates(option.value);
      if (currentRange.startDate === start && currentRange.endDate === end) {
        return option.value;
      }
    }

    return null;
  }, [currentRange?.startDate, currentRange?.endDate]);

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 px-3 py-4 shadow-lg shadow-slate-900/30 sm:px-4 sm:py-4 lg:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/70 text-emerald-300">
            <Calendar className="size-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-white">
              Intervalo de datas
            </h2>
            <p className="text-xs text-slate-400">
              Filtre as métricas entre duas datas específicas ou escolha um período rápido.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center min-w-0 w-full sm:w-auto">
          <div className="flex flex-col gap-3 sm:flex-row w-full sm:w-auto">
            <label className="flex flex-col text-xs text-slate-400 min-w-0 flex-1 sm:flex-none sm:w-auto">
              Início
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                max={endDate || undefined}
                className="mt-1 w-full min-w-0 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
              />
            </label>
            <label className="flex flex-col text-xs text-slate-400 min-w-0 flex-1 sm:flex-none sm:w-auto">
              Fim
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                min={startDate || undefined}
                className="mt-1 w-full min-w-0 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
              />
            </label>
          </div>

  <div className="flex flex-wrap items-center gap-2">
    <button
      type="button"
      onClick={handleApply}
      className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
    >
      Aplicar
    </button>
    <button
      type="button"
      onClick={handleClear}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-emerald-400 hover:text-emerald-200"
    >
      <RotateCcw className="size-4" />
      Limpar
    </button>
  </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {QUICK_OPTIONS.map((option) => {
          const isActive = activeQuickOption === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleQuickSelect(option.value)}
              className={clsx(
                "rounded-lg border px-2.5 py-1.5 text-xs font-medium transition",
                isActive
                  ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                  : "border-slate-700 bg-slate-900/80 text-slate-200 hover:border-emerald-400 hover:text-emerald-200",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

