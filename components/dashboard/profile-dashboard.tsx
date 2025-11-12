"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useMemo } from "react";
import { LogOut, Shield, Building } from "lucide-react";

export function ProfileDashboard() {
  const { admin, logout } = useAuth();
  const router = useRouter();

  const citiesLabel = useMemo(() => {
    if (!admin) return "—";
    if (admin.isSuperAdmin) return "Todas as prefeituras";
    if (!admin.allowedCities || admin.allowedCities.length === 0) return "Nenhuma cidade vinculada";
    return admin.allowedCities.join(", ");
  }, [admin]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!admin) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg shadow-slate-900/30">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300">
              <Shield className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white">
                {admin.name}
              </h1>
              <p className="text-sm text-slate-400">
                Conta administrativa ResolveAI · Último acesso:&nbsp;
                {admin.lastLoginAt
                  ? new Date(admin.lastLoginAt).toLocaleString("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              E-mail
            </p>
            <p className="mt-2 text-sm font-medium text-slate-100">
              {admin.email ?? "—"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              CPF
            </p>
            <p className="mt-2 text-sm font-medium text-slate-100">
              {admin.cpf ?? "—"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
              <Building className="size-4 text-emerald-300" />
              Prefeituras habilitadas
            </p>
            <p className="mt-2 text-sm font-medium text-slate-100">{citiesLabel}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Nível de acesso
            </p>
            <p className="mt-2 inline-flex items-center gap-2 rounded-full border border-emerald-500/50 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-300">
              {admin.isSuperAdmin ? "Super Admin" : "Administrador municipal"}
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-slate-300">
          <span>Precisa revogar acessos? Fale com o time ResolveAI.</span>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl border border-rose-500/50 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-200 transition hover:bg-rose-500/20"
          >
            <LogOut className="size-4" />
            Sair da conta
          </button>
        </div>
      </section>
    </div>
  );
}



