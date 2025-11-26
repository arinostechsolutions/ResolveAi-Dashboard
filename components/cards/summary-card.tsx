"use client";

import { ReactNode } from "react";
import { clsx } from "clsx";

type SummaryCardProps = {
  title: string;
  value: ReactNode;
  description?: string;
  icon?: ReactNode;
  tone?: "emerald" | "violet" | "sky" | "amber";
};

const toneToClasses: Record<
  NonNullable<SummaryCardProps["tone"]>,
  string
> = {
  emerald:
    "from-emerald-500/90 to-emerald-400 text-emerald-950 shadow-emerald-500/30",
  violet:
    "from-violet-500/90 to-violet-400 text-violet-950 shadow-violet-500/30",
  sky: "from-sky-500/90 to-sky-400 text-sky-950 shadow-sky-500/30",
  amber:
    "from-amber-400/90 to-amber-300 text-amber-950 shadow-amber-500/30",
};

export function SummaryCard({
  title,
  value,
  description,
  icon,
  tone = "emerald",
}: SummaryCardProps) {
  return (
    <article
      className={clsx(
        "relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg shadow-slate-900/40 transition hover:shadow-xl",
      )}
    >
      <div
        className={clsx(
          "absolute -top-24 right-0 h-40 w-40 rounded-full bg-gradient-to-bl blur-3xl",
          toneToClasses[tone],
        )}
        aria-hidden
      />
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
            {title}
          </span>
          <div className="text-3xl font-semibold text-white">{value}</div>
          {description ? (
            <p className="max-w-xs text-sm text-slate-400">{description}</p>
          ) : null}
        </div>
        {icon ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white">
            {icon}
          </div>
        ) : null}
      </div>
    </article>
  );
}








