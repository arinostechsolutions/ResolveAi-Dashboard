"use client";

import { ReactNode } from "react";
import { Bell, UserCircle2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";

type TopbarProps = {
  citySelect: ReactNode;
};

export function Topbar({ citySelect }: TopbarProps) {
  const { admin } = useAuth();

  return (
    <header className="flex flex-col gap-4 border-b border-slate-800 bg-slate-900/60 px-6 py-4 backdrop-blur lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">
          Monitoramento das Denúncias
        </h1>
        <p className="text-sm text-slate-400">
          Acompanhe em tempo real a operação da ResolveAI junto à prefeitura.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {citySelect}
        <button
          className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900/80 p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white"
          aria-label="Notificações"
        >
          <Bell className="size-5" />
        </button>
        <Link
          href="/profile"
          className="inline-flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 transition hover:border-emerald-400 hover:text-emerald-200"
        >
          <UserCircle2 className="size-5 text-emerald-300" />
          <div className="flex flex-col leading-tight">
            <span className="font-medium">{admin?.name ?? "Administrador"}</span>
            <span className="text-xs text-slate-400">
              {admin?.isSuperAdmin ? "Super Admin" : "Prefeituras"}
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
}

